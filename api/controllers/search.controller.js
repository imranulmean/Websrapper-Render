import { AldiCollection, ColesCollection, WoolsCollection, IgaCollection, AusiCollection,
          ColesCollection2, WoolsCollection2, IgaCollection2 } from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';
import {getPredictedCategories} from './predictedCategories.js';
import stringSimilarity from 'string-similarity';
// const predictedCategories=["Milk", "Pasta", "Eggs", "Butter", "Cheese", "Noodles", "Yoghurt", 
//                           "Margarine",  "Sauce" ,"Ready","Vegan", "Drink", "Honey", "Bread", "Custard", "Sport",
//                           "Chocolate", ]

let predictedCategories=[];


  function findClosestMatch(input) {
    let closestMatch = null;
    let minDistance = Infinity;

    // Iterate over predicted categories to find the closest match
    predictedCategories.forEach(category => {
        const distance = levenshteinDistance(category.toLowerCase(), input.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            closestMatch = category;
        }
    });

    return closestMatch;
}

function levenshteinDistance(a, b) {
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
        distanceMatrix[0][i] = i;
    }

    for (let j = 0; j <= b.length; j++) {
        distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            distanceMatrix[j][i] = Math.min(
                distanceMatrix[j][i - 1] + 1, // Deletion
                distanceMatrix[j - 1][i] + 1, // Insertion
                distanceMatrix[j - 1][i - 1] + indicator // Substitution
            );
        }
    }

    return distanceMatrix[b.length][a.length];
}

  
  async function advanceSearchEngine(req, collectionName, limit, startIndex){
   
    //////////Using Predicted Categories////////////
      let searchTerm = req.query.searchTerm || '';
      predictedCategories=await getPredictedCategories()
      const  predictedCategoriesRegex= new RegExp(predictedCategories.join('|'), 'gi');
      let matchCategories = searchTerm.match(predictedCategoriesRegex);
      if(!matchCategories || matchCategories==null){
        matchCategories=[];        
        matchCategories.push(findClosestMatch(searchTerm));
      }
      const regexPattern = new RegExp(matchCategories.join('|'), 'gi');   
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
    /////////////////////////

    let products = await collectionName.find(query)
      .sort({ productTitle: 1 })
      .skip(startIndex)
      .limit(limit);
    let totalProducts = await collectionName.countDocuments();
    return {products, totalProducts}
  }
  
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
      ///////////////////// Advance Search Logic ////////////
      // if(totalProducts===0){        
      //     console.log("Entering the Advance Logic")
      //     const { products: advanceSearchProducts, totalProducts: advanceSearchTotalProducts }=await advanceSearchEngine(req, collectionName, limit, startIndex)
      //     products=advanceSearchProducts;
      //     totalProducts=advanceSearchTotalProducts;          
      // }
      //////////////////////////////////////////////
  
      return {
        products,
        totalProducts,
      };
    } catch (error) {
      throw error;
    }
  }

  export const getSearchProducts = async (req, res, next) => {  
    try {
      // const { products: colesProducts, totalProducts: colesTotalProducts } = await getProducts(req, ColesCollection, 10);
      // const { products: woolsProducts, totalProducts: woolsTotalProducts } = await getProducts(req, WoolsCollection, 10);
      // const { products: igaProducts, totalProducts: igaTotalProducts } = await getProducts(req, IgaCollection, 10);
      // const combinedProducts = colesProducts.concat(woolsProducts, igaProducts);
      // const totalProducts = colesTotalProducts + woolsTotalProducts + igaTotalProducts;
      const [ausiResult, colesResult, woolsResult, igaResult, 
              colesResult2, woolsResult2, igaResult2 ] = await Promise.all([
        getProducts(req, AusiCollection, 10),
        getProducts(req, ColesCollection, 10),
        getProducts(req, WoolsCollection, 10),
        getProducts(req, IgaCollection, 10),
        getProducts(req, ColesCollection2, 10),
        getProducts(req, WoolsCollection2, 10),
        getProducts(req, IgaCollection2, 10),

    ]);
    
    const combinedProducts = ausiResult.products.concat(colesResult.products, woolsResult.products, igaResult.products,
                                                      colesResult2.products, woolsResult2.products, igaResult2.products);
    // const combinedProducts = colesResult.products.concat(woolsResult.products, igaResult.products);
    const totalProducts = colesResult.totalProducts + woolsResult.totalProducts + igaResult.totalProducts;
      
      res.status(200).json({
        products: combinedProducts,
        totalProducts: totalProducts,
      });
    } catch (error) {
      console.log(error)
      next(error);
    }
  };  

  /////////////////////Getting The Similar Products //////////

