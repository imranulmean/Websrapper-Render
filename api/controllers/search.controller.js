import { AldiCollection, ColesCollection, WoolsCollection } from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';
import {getPredictedCategories} from './predictedCategories.js';
import natural from 'natural';

// const predictedCategories=["Milk", "Pasta", "Eggs", "Butter", "Cheese", "Noodles", "Yoghurt", 
//                           "Margarine",  "Sauce" ,"Ready","Vegan", "Drink", "Honey", "Bread", "Custard", "Sport",
//                           "Chocolate", ]

let predictedCategories=[];

 function generateCombinations(words) {
    let combinations = [];
    
    // Single-word combinations
    if(words.length===1){
        for (let i = 0; i < words.length; i++) {
            combinations.push(words[i]);
        }
    }

    // Generate combinations of length 2
    for (let i = 0; i < words.length; i++) {
        for (let j = i + 1; j < words.length; j++) {
            combinations.push(words[i] + " " + words[j]);
        }
    }    
    return combinations;
  }


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
    // let query = {
    //   ...(req.query.mainCategoryName && { mainCategoryName: req.query.mainCategoryName }),
    //   ...(req.query.subCategoryName && { subCategoryName: req.query.subCategoryName }),
    //   ...(req.query.shop && { shop: req.query.shop }),
    // };
  // Check if a search term is provided
    // if (req.query.searchTerm) {
    //    let searchTerm = req.query.searchTerm;      
    //   // Split the search term into individual words
    //   const searchTerms = searchTerm.split(' ').filter(word => word.trim() !== '');
    //   // Generate combinations of search terms
    //   const combinationArray = generateCombinations(searchTerms);
    //   const regexPatterns = combinationArray.map(combination => new RegExp(combination.split(' ').map(term => `(?=.*\\b${term})`).join(''), 'i'));
    //     query.$or = regexPatterns.map(pattern => ({ productTitle: { $regex: pattern } }))
    // }
    
    //////////Using Predicted Categories////////////
      let searchTerm = req.query.searchTerm || '';
      predictedCategories=await getPredictedCategories()
      const  predictedCategoriesRegex= new RegExp(predictedCategories.join('|'), 'gi');
      let matchCategories = searchTerm.match(predictedCategoriesRegex);
      // console.log("Search Term:", searchTerm)
      // console.log("First getting the matchCategories:", matchCategories)
      if(!matchCategories || matchCategories==null){
        matchCategories=[];        
        matchCategories.push(findClosestMatch(searchTerm));
        // console.log("Second getting the matchCategories:", matchCategories)
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
      if(totalProducts===0){        
          console.log("Entering the Advance Logic")
          const { products: advanceSearchProducts, totalProducts: advanceSearchTotalProducts }=await advanceSearchEngine(req, collectionName, limit, startIndex)
          products=advanceSearchProducts;
          totalProducts=advanceSearchTotalProducts;          
      }
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
      const { products: colesProducts, totalProducts: colesTotalProducts } = await getProducts(req, ColesCollection, 10);
      const { products: woolsProducts, totalProducts: woolsTotalProducts } = await getProducts(req, WoolsCollection, 10);
      const combinedProducts = colesProducts.concat(woolsProducts);
      const totalProducts = colesTotalProducts + woolsTotalProducts;
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
// Create a LevenshteinDistance instance
const levenshtein = natural.LevenshteinDistance;

export const findSimilarProducts = async (req, res, next) => {
  console.log(natural.JaroWinklerDistance("Cream Milk 1l", "A2 Dairy Full Cream Milk | 2L"));
  try {
    // Aggregate distinct product titles from ColesCollection
    const colesTitles = await ColesCollection.aggregate([
      { $group: { _id: '$productTitle' } }
    ]);
    // Aggregate distinct product titles from WoolsCollection
    const woolsTitles = await WoolsCollection.aggregate([
      { $group: { _id: '$productTitle' } }
    ]);

    // Merge titles from both collections into a single array
    const allTitles = [...colesTitles, ...woolsTitles].map(title => title._id);
    // Find similar titles using fuzzy matching
    const similarProducts = [];
    for (const title of allTitles) {
      // Query both collections for products with similar titles
      const colesProducts = await ColesCollection.find({ productTitle: { $regex: title, $options: 'i' } });
      const woolsProducts = await WoolsCollection.find({ productTitle: { $regex: title, $options: 'i' } });

      // Add similar products to the result array
      if (colesProducts.length > 0 || woolsProducts.length > 0) {
        similarProducts.push({ title, colesProducts, woolsProducts });
      } else {
        // If no exact match found, perform fuzzy matching
        const similarColesProducts = await ColesCollection.find({
          productTitle: { $regex: title.split(' ').join('.*'), $options: 'i' }
        });

        const similarWoolsProducts = await WoolsCollection.find({
          productTitle: { $regex: title.split(' ').join('.*'), $options: 'i' }
        });

        // Add similar products to the result array based on Levenshtein distance
        if (similarColesProducts.length > 0 || similarWoolsProducts.length > 0) {
          const colesSimilarity = similarColesProducts.map(product => ({
            product,
            similarity: levenshtein.get(title, product.productTitle)
          }));

          const woolsSimilarity = similarWoolsProducts.map(product => ({
            product,
            similarity: levenshtein.get(title, product.productTitle)
          }));

          similarProducts.push({ title, colesProducts: colesSimilarity, woolsProducts: woolsSimilarity });
        }
      }
    }

    // Return the result
    res.status(200).json({
      products: similarProducts,
    });
  } catch (error) {
    console.error('Error finding similar products:', error);
    throw error;
  }
}


// This will be implemented Later on

//   const predictedCategories=["Milk", "Pasta", "Eggs", "Butter", "Cheese", "Noodles", "Yoghurt", 
//                            "Margarine", "Sauce", "Ready", "Vegan", "Drink"];

// function findClosestMatch(input) {
//     let closestMatch = null;
//     let minDistance = Infinity;

//     // Iterate over predicted categories to find the closest match
//     predictedCategories.forEach(category => {
//         const distance = levenshteinDistance(category.toLowerCase(), input.toLowerCase());
//         if (distance < minDistance) {
//             minDistance = distance;
//             closestMatch = category;
//         }
//     });

//     return closestMatch;
// }

// function levenshteinDistance(a, b) {
//     const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

//     for (let i = 0; i <= a.length; i++) {
//         distanceMatrix[0][i] = i;
//     }

//     for (let j = 0; j <= b.length; j++) {
//         distanceMatrix[j][0] = j;
//     }

//     for (let j = 1; j <= b.length; j++) {
//         for (let i = 1; i <= a.length; i++) {
//             const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
//             distanceMatrix[j][i] = Math.min(
//                 distanceMatrix[j][i - 1] + 1, // Deletion
//                 distanceMatrix[j - 1][i] + 1, // Insertion
//                 distanceMatrix[j - 1][i - 1] + indicator // Substitution
//             );
//         }
//     }

//     return distanceMatrix[b.length][a.length];
// }

// // Test the function
// console.log(findClosestMatch("chese")); // Outputs: "Cheese"
// console.log(findClosestMatch("btr"));   // Outputs: "Butter"
// console.log(findClosestMatch("yugrut")); // Outputs: "Yoghurt"