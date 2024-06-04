import { AldiCollection, ColesCollection, WoolsCollection, IgaCollection } from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';
import {getPredictedCategories} from './predictedCategories.js';
import fs from 'fs';

let predictedCategories=[];

async function getProductType_Weights_Brand_productPrice(pTitle){
    let brandName=pTitle.split(' ')[0];
    
    if(predictedCategories.length===0){
        predictedCategories=await getPredictedCategories();
    }
    const  predictedCategoriesRegex= new RegExp(predictedCategories.join('|'), 'gi');
    const matchCategories = pTitle.match(predictedCategoriesRegex);
    var productType = matchCategories ? matchCategories : null;
    var weightMatch = pTitle.match(/(\d+(\.\d+)?(kg|L|gm|g|ml))/i);
    var weight = weightMatch ? weightMatch[1] : null;
    return { productType, weight, brandName }
  }

  async function getComparisonProducts_with_Type_Weights_Engine(pTitle,collectionName, pPrice){  
    try {

      const {productType, weight ,brandName} = await getProductType_Weights_Brand_productPrice(pTitle);        
      let combinedPattern = '';
      if (productType && productType.length > 0 && weight) {
          combinedPattern = productType.map(type => `^${brandName}.*${type}.*${weight}`).join('|');
      }
      const combinedRegex = new RegExp(combinedPattern, 'i');
        let query = {};
        if (combinedPattern) {
            query.productTitle = { $regex: combinedRegex };
            // query.productPrice={$lte:Number(pPrice)}
        }
        // let products = await collectionName.find(query).select('productTitle productPrice productImage shop');
        let products = await collectionName.aggregate([
          { $match: query },
          { 
              $group: {
                  _id: "$productTitle",
                  productTitle: { $first: "$productTitle" },
                  productPrice: { $first: "$productPrice" },
                  productImage: { $first: "$productImage" },
                  shop: { $first: "$shop" }
              }
          }
        ]);  
        let filteredProducts=[];
        for (let product of products){
            // product.productTitle=product.toObject().productTitle.replace(" |",'');
            product.productTitle=product.productTitle.replace(" |",'');
            let matched= calculateMatchingPercentage(pTitle, product.productTitle);
            if(matched>80 && product){
                filteredProducts.push(product)
            }            
        }
        return { 
          products:filteredProducts,
        };
    } catch (error) {
      throw error;
    }
  
  } 

function calculateMatchingPercentage(pTitle, text) {

  const searchTermWords = pTitle.toLowerCase().match(/\w+/g);
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

function generateCombinations(productGroups) {
  const combinations = [];
  const combine = (current, depth) => {
      if (depth === productGroups.length) {
          combinations.push(current);
          return;
      }
      for (let product of productGroups[depth]) {
          combine([...current, product], depth + 1);
      }
  };
  combine([], 0);
  return combinations;
}

function all_combination_same_price(combinationsWithTotal){
    const shopCounts = combinationsWithTotal.map(item => {
        let shops = item.combination.map(product => product.shop);
        let uniqueShops = new Set(shops);
        return uniqueShops.size;
    });
    const minShops = Math.min(...shopCounts);
    const minShopCombinations = combinationsWithTotal.filter((item, index) => shopCounts[index] === minShops);
    return minShopCombinations;
}

export const cartCalculation = async(req, res, next) =>{

    let addedProductIds = new Set();
    let productGroups = [];

    for(let userItem of req.body){
        let combinedProducts;
        let {productTitle, productPrice}=userItem;
        productTitle=productTitle.replace(" |",'');
        const {productType, weight ,brandName} = await getProductType_Weights_Brand_productPrice(productTitle);        
        const {products: colesProducts}=await getComparisonProducts_with_Type_Weights_Engine(productTitle, ColesCollection, productPrice)
        const {products: woolsProducts}=await getComparisonProducts_with_Type_Weights_Engine(productTitle, WoolsCollection, productPrice)
        const {products: igaProducts}=await getComparisonProducts_with_Type_Weights_Engine(productTitle, IgaCollection, productPrice)
        combinedProducts=colesProducts.concat(woolsProducts, igaProducts);
        // if (productType && productType.length > 0) {
        //     for (let type of productType) {
        //         let filteredProducts = combinedProducts.filter(product => {
        //             if (!addedProductIds.has(product._id.toString())) {
        //                 addedProductIds.add(product._id.toString());
        //                 return true;
        //             }
        //             return false;
        //         });
        //         if (filteredProducts.length > 0) {
        //             // productGroups.push(filteredProducts.map(product => ({ [type]: product })));
        //             productGroups.push(filteredProducts.map(product => (product)));
        //         }
        //     }
        // }
        productGroups.push(combinedProducts.map(product => (product)));
    }
    // Create combinations
    const finalProducts = generateCombinations(productGroups);
    // Calculate total price for each combination and include it in the response
    let combinationsWithTotal = finalProducts.map(combination => {
      const totalPrice = combination.reduce((acc, product) => acc + product.productPrice, 0);
      return { combination, totalPrice };
    });
    combinationsWithTotal.sort((a, b) => a.totalPrice - b.totalPrice);
    //////////// Now Check if All the combinations have same price, Then Choose the combination that have less visited Shops //////////
    let totalPrices = combinationsWithTotal.map(item => item.totalPrice);
    let allSameTotalPrice = totalPrices.every(price => price === totalPrices[0]);
    console.log("All combinations have the same total price:", allSameTotalPrice);

    if(allSameTotalPrice){
        combinationsWithTotal=all_combination_same_price(combinationsWithTotal);
    }


    res.status(200).json({
        products:combinationsWithTotal
    });
}