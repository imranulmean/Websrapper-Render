import { AldiCollection, ColesCollection, WoolsCollection } from '../models/product.model.js';
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

async function getMainCategories(req, collectionName){
  const parsedMainCategory = req.query.mainCategoryName.split(',').map(value => value.trim());
  const regexPattern = parsedMainCategory.join('|');
  const mainCategoryQuery = { mainCategoryName: { $regex: regexPattern, $options: 'i' } };
  let distinctMainCategoryNames= await collectionName.distinct("mainCategoryName", mainCategoryQuery);
  return distinctMainCategoryNames
}

async function getComparisonEngine(req, collectionName, limit1) {
  try {
    let searchTerm = req.query.searchTerm || '';
    /////////////Using the Predicted Category ///////////
      predictedCategories=await getPredictedCategories();
      const  predictedCategoriesRegex= new RegExp(predictedCategories.join('|'), 'gi');
      const matchCategories = searchTerm.match(predictedCategoriesRegex);
      const regexPattern = new RegExp(matchCategories.join('|'), 'gi'); 
      const productPrice = Number(req.query.productPrice);
      let query = {
        ...(req.query.productPrice && { productPrice: { $lt: productPrice } }),
        ...(req.query.searchTerm && { productTitle:{$regex: regexPattern}} )
        };    
        let products = await collectionName.find(query).sort({ productPrice: 1 })
        
        return { products };      
    //////////////////////

    // const productPrice = Number(req.query.productPrice);
    // let mainCategoryNames=await getMainCategories(req, collectionName)
    // let query = {
    // ...(req.query.productPrice && { productPrice: { $lte: productPrice } }),
    // ...(req.query.mainCategoryName && { mainCategoryName:{$in:mainCategoryNames}} )
    // };    
    // let products = await collectionName.find(query).sort({ productPrice: 1 })
    
    // return { products };
  } catch (error) {
    throw error;
  }
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

export const getComparisonProducts = async (req, res, next) => {  
  try {
    const { products: colesProducts } = await getComparisonEngine(req, ColesCollection, 10);
    const { products: woolsProducts } = await getComparisonEngine(req, WoolsCollection, 10);
    const combinedProducts = colesProducts.concat(woolsProducts);
     let finalProducts=[];
    ////////////////
      // Loop through combinedProducts
      combinedProducts.forEach((product1) => {
        const parsedProduct=product1.toObject();
        const matchingPercentage = calculateMatchingPercentage(req.query.searchTerm, parsedProduct.productTitle);
        // If matching percentage is more than 60%, add to finalProducts array
        // console.log("searchTerm: ", req.query.searchTerm)
        // console.log("Current Name: ", parsedProduct.productTitle)
        // console.log("matchingPercentage: ", matchingPercentage)
        if (matchingPercentage > 50) {
            finalProducts.push(product1);
        }
      });

    ///////////////
    res.status(200).json({
      products: finalProducts,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

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
    let searchTermFromUrl= (req.query.searchTermFromUrl || '').trim();
    const {productType, weight ,brandName, productPrice} = await getProductType_Weights_Brand_productPrice(req);
    let combinedPattern = '';
    if(searchTermFromUrl && searchTermFromUrl!==''){
      // productType=[];
      productType.unshift(searchTermFromUrl);
    }
    if (productType && productType.length > 0 && weight) {
        combinedPattern = productType.map(type => `${type}.*${weight}`).join('|');
    } 
    else{
      combinedPattern='';
    }
    // else if (productType && productType.length > 0) {
    //     combinedPattern = productType.join('|');
    // } else if (weight) {
    //     combinedPattern = weight;
    // }    
    const combinedRegex = new RegExp(combinedPattern, 'i');
    // console.log("searchTerm: ",searchTerm)
    // console.log("searchTermFromUrl: ",searchTermFromUrl)
    // console.log("brandName: ",brandName)
    // console.log("productPrice: ",productPrice)
    // console.log("predictedCategoriesRegex: ",predictedCategoriesRegex)
    // console.log("productType: ",productType)
    // console.log("weight: ",weight)
    // console.log("combinedPattern: ",combinedPattern)
     console.log("combinedRegex: ",combinedRegex)
      let query = {};
  
      // Add combined regex pattern to query for productTitle
      if (combinedPattern) {
          query.productTitle = { $regex: combinedRegex };
      }
  
      // Add product price to the query if available and valid
      if (!isNaN(productPrice)) {
          query.productPrice = { $lt: productPrice };
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

// async function getComparisonProducts_only_Weights_Engine(req, collectionName, combinedProducts, weight, productPrice, limit1){

//   try{
//     const productTitles = combinedProducts.map(product => product.toObject().productTitle);
//     // Constructing the query object for weight pattern only (excluding already found products)
//     let weightQuery = {};
//     if (weight) {
//         weightQuery.productTitle = { $regex: new RegExp(weight, 'i') };
//         if (productTitles.length > 0) {
//             weightQuery.productTitle.$nin = productTitles;
//         }
//     }
//     if (!isNaN(productPrice)) {
//         weightQuery.productPrice = { $lt: productPrice };
//     }

//     // Execute the query for weight pattern
//     let weightProducts = [];
//     if (Object.keys(weightQuery).length > 0) {
//         weightProducts = await collectionName.find(weightQuery).sort({ productPrice: 1 });
//     }
//     return {weightProducts}
//   }
//   catch(error){
//     throw error;
//   }


// }

export const getComparisonProducts_with_Type_Weights = async (req, res, next) => {
  try {
    const { products: colesProducts, weight:colesWeight, productPrice:colesPrice } = await getComparisonProducts_with_Type_Weights_Engine(req, ColesCollection, 10);
    const { products: woolsProducts, weight:woolsWeight, productPrice:woolsPrice } = await getComparisonProducts_with_Type_Weights_Engine(req, WoolsCollection, 10);
    const combinedProducts = colesProducts.concat(woolsProducts);

    // const { weightProducts: colesWeightProducts } = await getComparisonProducts_only_Weights_Engine(req, ColesCollection, combinedProducts, colesWeight, colesPrice, 10)
    // const { weightProducts: woolsWeightProducts } = await getComparisonProducts_only_Weights_Engine(req, WoolsCollection, combinedProducts, woolsWeight, woolsPrice, 10);
    // const combinedWeightProducts = colesWeightProducts.concat(woolsWeightProducts);
    // const allCombinedProducts=combinedProducts.concat(combinedWeightProducts);
    // Return the result
    res.status(200).json({
        products: combinedProducts
    });    
  } catch (error) {
    console.log(error);
    next(error);    
  }
}

async function getComparisonProducts_only_Weights_Api_Engine(req, collectionName, limit1){

  try{
    const existingProducts=req.body;
    const {productType, weight ,brandName, productPrice} = await getProductType_Weights_Brand_productPrice(req);
    const productTitles = existingProducts.map(product => product.productTitle);
    // Constructing the query object for weight pattern only (excluding already found products)
    let weightQuery = {};
    if (weight) {
        weightQuery.productTitle = { $regex: new RegExp(weight, 'i') };
        if (productTitles.length > 0) {
            weightQuery.productTitle.$nin = productTitles;
        }        
    }
    if (!isNaN(productPrice)) {
        weightQuery.productPrice = { $lt: productPrice };
    }

    // Execute the query for weight pattern
    let weightProducts = [];
    weightProducts = await collectionName.find(weightQuery).sort({ productPrice: 1 });
    return {weightProducts}
  }
  catch(error){
    throw error;
  }


}

export const getComparisonProducts_with_Only_Weights = async (req, res, next) => {
  try {
    const { weightProducts: colesWeightProducts } = await getComparisonProducts_only_Weights_Api_Engine(req, ColesCollection, 10)
    const { weightProducts: woolsWeightProducts } = await getComparisonProducts_only_Weights_Api_Engine(req, WoolsCollection, 10);
    const combinedWeightProducts = colesWeightProducts.concat(woolsWeightProducts);
    // Return the result
    res.status(200).json({
        products: combinedWeightProducts
    });    
  } catch (error) {
    console.log(error);
    next(error);    
  }
}


// function calculateMatchingPercentage(searchTerm, text) {
//   const searchTermWords = searchTerm.toLowerCase().match(/\w+/g);
//   console.log(searchTermWords)
//   const textWords = text.toLowerCase().match(/\w+/g);
  
//   if (!searchTermWords || !textWords) return 0;
  
//   let matchingWords = 0;
//   searchTermWords.forEach(word => {
//       if (textWords.includes(word)) {
//           matchingWords++;
//       }
//   });
  
//   return (matchingWords / searchTermWords.length) * 100;
// }

// var searchTerm="Coles Free Range Eggs 12 Pack | 700g"
// var text="Woolworths 12 Extra Large Cage Free Eggs 700g"
// var matched=calculateMatchingPercentage(searchTerm, text)
// console.log(matched)

///////////////////////////////////////////////////
// var searchTerm = "Devondale Full Cream Long Life Milk 6 pack | 1.2L"
// var milkMatch = searchTerm.match(/\b(milk)\b/i);
// var milkType = milkMatch ? milkMatch[1] : null;
// var weightMatch = searchTerm.match(/(\d+(\.\d+)?(kg|L))/i);
// var weight = weightMatch ? weightMatch[1] : null;

// var otherStrings = [
//     "A2 Dairy Full Cream Milk | 1L",
//     "Devondale Full Cream Milk | 2L",
//     "Devondale Full Cream Milk | 2L",
//     "Green Pastures Full Cream Milk | 2L",
//     "Pura Full Cream Milk | 2L",
//     "Green Pastures Full Cream Milk | 2L",
//     "Great Ocean Road Fresh Full Cream Milk | 2L",
//     "East Coast Sustainable Dairy Full Cream Milk | 2L",
//     "Devondale Full Cream Long Life Milk 6 pack | 1.2L",
//     "Pauls Zymil Gluten free & lactose Free Full Cream Milk | 2L",
//     "Dairy Farmers Full Cream Milk 1l"
// ];

// // Filtering otherStrings array based on milkType and weight
// var filteredStrings = otherStrings.filter(str => {
//     return str.match(new RegExp(milkType, 'i')) && str.match(new RegExp(weight, 'i'));
// });
// console.log(filteredStrings);


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
//     $group: {
//       _id: "$mainCategoryName",
//       "subCategories": { "$addToSet": "$subCategoryName" }
//     }
//   },
//   {
//     $sort: { _id: 1 }
//   }
// ]