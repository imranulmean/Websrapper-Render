import { AldiCollection, ColesCollection, WoolsCollection } from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';
import {getPredictedCategories} from './predictedCategories.js';
import stringSimilarity from 'string-similarity';
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

export const findSimilarProducts = async (req, res, next) => {
  // console.log(natural.JaroWinklerDistance("Coles Free Range Eggs 12 Pack | 600g", "Lake Macquarie 30 Large Free Range Eggs 1.5kg"));
  // const colesProducts= await ColesCollection.find();
  // const woolsProducts= await WoolsCollection.find();
  // console.log(`colesProducts: ${colesProducts.length}, WoolsProducts: ${woolsProducts.length}`)
  let colesTitle="Coles Free Range Eggs 12 Pack | 600g";
  colesTitle= colesTitle.replace("| ", '');
  let woolsTitle="Liberty Eggs 12 Jumbo Cage Free Eggs 800g";
  console.log("colesTitle: ", colesTitle)
  console.log("WoolsTitle: ", woolsTitle)
  const generalCalculate=calculateMatchingPercentage(colesTitle, woolsTitle);
  console.log("generalCalculate: ", generalCalculate)  
  const similarity = stringSimilarity.compareTwoStrings(colesTitle, woolsTitle);
  console.log("String similarity Library: ",similarity);
  try {
      res.status(200).json({
        products:"Hello"
      })
    }

  
  catch (error) {
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