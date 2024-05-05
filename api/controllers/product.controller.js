import { AldiCollection, ColesCollection, WoolsCollection } from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';




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
    const productPrice = Number(req.query.productPrice);
    let query = {
    ...(req.query.productPrice && { productPrice: { $lte: productPrice } }),
    ...(req.query.productPrice && { mainCategoryName:mainCategoryNames[0]} )
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