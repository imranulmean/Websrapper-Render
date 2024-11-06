import { AldiCollection, ColesCollection, WoolsCollection, IgaCollection, AusiCollection, 
        ColesCollection2, WoolsCollection2, IgaCollection2   } from '../models/product.model.js';
import Categories from '../models/categories.model.js';
import {getPredictedCategories} from './predictedCategories.js';
import { errorHandler } from '../utils/error.js';

// let predictedCategories=["Milk", "Pasta", "Eggs", "Butter", "Cheese", "Noodles", "Yoghurt", 
//                           "Margarine", "Sauce", "Ready", "Vegan", "Drink", "Honey", "Bread", "Custard", "Sport",
//                           "Chocolate", "Pizza"]

let predictedCategories=[];
async function getProducts(req, collectionName, limit1) {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || limit1;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    let searchTerm = req.query.searchTerm || '';
    let regexPattern = '';
    if (searchTerm) {
      regexPattern = new RegExp(searchTerm.split(' ').map(term => `(?=.*\\b${term})`).join(''), 'i');
    } 
    let query = {
      ...(req.query.mainCategoryName && { mainCategoryName: req.query.mainCategoryName }),
      ...(req.query.subCategoryName && { subCategoryName: req.query.subCategoryName }),
      ...(req.query.shop && { shop: req.query.shop }),
      ...(req.query.searchTerm && {
        $or: [
          { productTitle: { $regex: regexPattern } }
        ],
      }),
    };

    let products = await collectionName.find(query)
      .sort({ productTitle: 1 })
      .skip(startIndex)
      .limit(limit);
    let totalProducts = await collectionName.countDocuments({ productTitle: { $regex: regexPattern } });


    return {
      products,
      totalProducts,
    };
  } catch (error) {
    throw error;
  }
}

export const getColesProducts = async (req, res, next) => {  
  try {
    ///////////// Creating Caterogies ///////
    // for(let p of predictedCategories){
    //   const newCategory= new Categories({categoryName:p});
    //   const categorySave= await newCategory.save();
    //   console.log(categorySave);
    // }
    ///////////////////////////////////////////
    const { products, totalProducts } = await getProducts(req, ColesCollection, 5);

    res.status(200).json({
      products,
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getWoolsProducts = async (req, res, next) => {  
  try {
    const { products, totalProducts } = await getProducts(req, WoolsCollection, 5);

    res.status(200).json({
      products,
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
};

export const getIgaProducts = async (req, res, next) => {  
  try {
    const { products, totalProducts } = await getProducts(req, IgaCollection, 5);

    res.status(200).json({
      products,
      totalProducts,
    });
  } catch (error) {
    next(error);
  }
};

async function getMainCategories(req, collectionName){
  const parsedMainCategory = req.query.mainCategoryName.split(',').map(value => value.trim());
  const regexPattern = parsedMainCategory.join('|');
  const mainCategoryQuery = { mainCategoryName: { $regex: regexPattern, $options: 'i' } };
  let distinctMainCategoryNames= await collectionName.distinct("mainCategoryName", mainCategoryQuery);
  return distinctMainCategoryNames
}

      // Function to calculate matching percentage between two strings
function calculateMatchingPercentage(searchTerm, text) {
  const searchTermWords = searchTerm.toLowerCase().match(/\w+/g);
  const textWords = text.toLowerCase().match(/\w+/g);
  
  if (!searchTermWords || !textWords) return 0;
  
  let matchingWords = 0;
  searchTermWords.forEach(word => {
      if (textWords.includes(word)) {
          matchingWords++;
      }
  });          
  return (matchingWords / searchTermWords.length) * 100;
}

async function getProductType_Weights_Brand_productPrice(req){
  let searchTerm = req.query.searchTerm || '';
  let searchTermFromUrl= (req.query.searchTermFromUrl || '').trim();
  let brandName=searchTerm.split(' ')[0];

  let productPrice = Number(req.query.productPrice);
  predictedCategories=await getPredictedCategories();
  const  predictedCategoriesRegex= new RegExp(predictedCategories.join('|'), 'gi');
  const matchCategories = searchTerm.match(predictedCategoriesRegex);
  var productType = matchCategories ? matchCategories : null;
  var weightMatch = searchTerm.match(/(\d+(\.\d+)?(kg|L|gm|g|ml))/i);
  var weight = weightMatch ? weightMatch[1] : null;
  return { productType, weight, brandName, productPrice}
}

async function getComparisonProducts_with_Type_Weights_Engine(req, collectionName, limit1){
  
  try {
    let searchTerm = req.query.searchTerm || '';
    let queryType=req.query.queryType;
    let searchTermFromUrl= (req.query.searchTermFromUrl || '').trim();
    const {productType, weight ,brandName, productPrice} = await getProductType_Weights_Brand_productPrice(req);
    let combinedPattern = '';
    if(searchTermFromUrl && searchTermFromUrl!=='' && productType && productType.length){
      productType.unshift(searchTermFromUrl);
    }
    if (productType && productType.length > 0 && weight) {
      if(queryType==="brand_category"){
        combinedPattern = productType.map(type => `^${brandName}.*${type}`).join('|');
      }
      if(queryType==="category_weight"){
        combinedPattern = productType.map(type => `.*${type}.*${weight}`).join('|');
      }
      if(queryType==="brand_weight"){
        combinedPattern = productType.map(type => `^${brandName}.*${weight}`).join('|');
      }            
        // combinedPattern = productType.map(type => `^${brandName}.*${type}.*${weight}`).join('|');
    }     
    if(!productType || productType==null || req.query.mainCategoryName==="Confectionary"){
      // combinedPattern='';
      combinedPattern =`^${brandName}.*${weight}`;
    }
    const combinedRegex = new RegExp(combinedPattern, 'i');

      let query = {};

      // Add combined regex pattern to query for productTitle
      if (combinedPattern) {
          query.productTitle = { $regex: combinedRegex };
      }
      // Add product price to the query if available and valid
      if (!isNaN(productPrice)) {
          query.productPrice = { $lte: productPrice };       
      }
      let products = await collectionName.find(query).sort({ productPrice: 1 });
      return { 
        products, 
        weight,
        productPrice
      };   
//////////////////////////////////      
  } catch (error) {
    throw error;
  }

} 


export const getComparisonProducts_with_Type_Weights = async (req, res, next) => {
  try {
    // const { products: ausiProducts, weight:ausiWeight, productPrice:ausiPrice } = await getComparisonProducts_with_Type_Weights_Engine(req, AusiCollection, 10);
    // const { products: colesProducts, weight:colesWeight, productPrice:colesPrice } = await getComparisonProducts_with_Type_Weights_Engine(req, ColesCollection, 10);
    // const { products: woolsProducts, weight:woolsWeight, productPrice:woolsPrice } = await getComparisonProducts_with_Type_Weights_Engine(req, WoolsCollection, 10);
    // const { products: igaProducts, weight:igaWeight, productPrice:igaPrice } = await getComparisonProducts_with_Type_Weights_Engine(req, IgaCollection, 10);
    // const combinedProducts = ausiProducts.concat(colesProducts, woolsProducts, igaProducts);
    const [ausiProducts, colesProducts, woolsProducts, igaProducts,
            colesProducts2, woolsProducts2, igaProducts2]= await Promise.all([
      getComparisonProducts_with_Type_Weights_Engine(req, AusiCollection, 10),
      getComparisonProducts_with_Type_Weights_Engine(req, ColesCollection, 10),
      getComparisonProducts_with_Type_Weights_Engine(req, WoolsCollection, 10),
      getComparisonProducts_with_Type_Weights_Engine(req, IgaCollection, 10),
      getComparisonProducts_with_Type_Weights_Engine(req, ColesCollection2, 10),
      getComparisonProducts_with_Type_Weights_Engine(req, WoolsCollection2, 10),
      getComparisonProducts_with_Type_Weights_Engine(req, IgaCollection2, 10),
    ]);
    
    const combinedProducts = ausiProducts.products.concat(colesProducts.products, woolsProducts.products, igaProducts.products,
                                                      colesProducts2.products, woolsProducts2.products, igaProducts2.products);
    // Return the result
    res.status(200).json({
        products: combinedProducts
    });    
  } catch (error) {
    console.log(error);
    next(error);    
  }
}

async function getSimilarProducts_DiffShop_ProductType_Weights_Brand_productPrice(pTitle){
  let brandName=pTitle.split(' ')[0];
  brandName=brandName.split("-")[0];
  if(predictedCategories.length===0){
      predictedCategories=await getPredictedCategories();
  }
  const  predictedCategoriesRegex= new RegExp(predictedCategories.join('|'), 'gi');
  const matchCategories = pTitle.match(predictedCategoriesRegex);
  var productType = matchCategories ? matchCategories : null;
  var weightMatch = pTitle.match(/(\d+(\.\d+)?(kg|L|gm|g|ml))/i);
  var weight = weightMatch ? weightMatch[1] : null;
  // Extract the pack size if it exists after the weight and can be either "pack" or "packs"
  var packSizeMatch = weightMatch && pTitle.substring(weightMatch.index + weightMatch[0].length).match(/(\d+\s*packs?)/i);
  var packSize = packSizeMatch ? packSizeMatch[1] : null;
  return { productType, weight, brandName, packSize };
}



///////////////////////////////////////////////////





////////////////////////////////////////////////////////
// [
//   {
//     $group: {
//       _id: "$subCategoryName",
//       products: { $push: "$$ROOT" },
//       totalProducts: { $sum: 1 }
//     }
//   },
//   {
//     $sort: { _id: 1 }
//   }
// ]

// [
//   {
//     $match: {
//       subCategoryName: "Cream"
//     }
//   },
//   {
//     $group: {
//       _id: "$subCategoryName",
//       products: { $push: "$$ROOT" },
//       totalProducts: { $sum: 1 }
//     }
//   },
//   {
//     $sort: { _id: 1 }
//   }
// ]

// [
//   {
//     $group: {
//       _id: "$mainCategoryName",
//       "subCategories": { "$addToSet": "$subCategoryName" }
//     }
//   },
//   {
//     $sort: { _id: 1 }
//   }
// ]