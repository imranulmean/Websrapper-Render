import { AldiCollection, ColesCollection, WoolsCollection } from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';



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




async function getComparisonEngine(req, collectionName, limit1) {
  try {
    let searchTerm = req.query.searchTerm || '';
    const mainCategory = req.query.mainCategoryName.split(',').map(value => value.trim());
    const regexPattern = mainCategory.join('|');
    const mainCategoryQuery = { mainCategoryName: { $regex: regexPattern, $options: 'i' } };
    let mainCategoryNames= await collectionName.distinct("mainCategoryName", mainCategoryQuery);
    console.log("Main mainCategoryName from query String: ", req.query.mainCategoryName);
    console.log("Main mainCategoryName After parsed in Array: ", mainCategory);
    console.log("getting the distinct mainCategoryNames:", mainCategoryNames);
    const productPrice = Number(req.query.productPrice);
    let query = {
    ...(req.query.productPrice && { productPrice: { $lte: productPrice } }),
    ...(req.query.mainCategoryName && { mainCategoryName:mainCategoryNames[0]} )
    };    
    let products = await collectionName.find(query).sort({ productPrice: 1 })
    
    return { products };
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
        if (matchingPercentage > 40) {
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