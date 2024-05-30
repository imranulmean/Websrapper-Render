import { AldiCollection, ColesCollection, WoolsCollection, IgaCollection } from '../models/product.model.js';
import { errorHandler } from '../utils/error.js';
import {getPredictedCategories} from './predictedCategories.js';


async function getProductType_Weights_Brand_productPrice(pTitle){
    let brandName=pTitle.split(' ')[0];
    let predictedCategories=await getPredictedCategories();
    const  predictedCategoriesRegex= new RegExp(predictedCategories.join('|'), 'gi');
    const matchCategories = pTitle.match(predictedCategoriesRegex);
    var productType = matchCategories ? matchCategories : null;
    var weightMatch = pTitle.match(/(\d+(\.\d+)?(kg|L|gm|g|ml))/i);
    var weight = weightMatch ? weightMatch[1] : null;
    return { productType, weight, brandName }
  }

  async function getComparisonProducts_with_Type_Weights_Engine(pTitle,collectionName){  
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
        }
        let products = await collectionName.find(query);
        let filteredProducts=[];
        for (let product of products){
            product.productTitle=product.toObject().productTitle.replace(" |",'');
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

export const cartCalculation = async(req, res, next) =>{

    let cartCalculationProducts=[];
    let cartCalculationProducts2=[];

    for(let userItem of req.body){
        let combinedProducts;
        let {productTitle, productPrice}=userItem;
        productTitle=productTitle.replace(" |",'');
        const {productType, weight ,brandName} = await getProductType_Weights_Brand_productPrice(productTitle);        
        const {products: colesProducts}=await getComparisonProducts_with_Type_Weights_Engine(productTitle, ColesCollection)
        const {products: woolsProducts}=await getComparisonProducts_with_Type_Weights_Engine(productTitle, WoolsCollection)
        const {products: igaProducts}=await getComparisonProducts_with_Type_Weights_Engine(productTitle, IgaCollection)
        combinedProducts=colesProducts.concat(woolsProducts, igaProducts);
        let productTypeObject = {};
        productTypeObject[productType] = combinedProducts;
        cartCalculationProducts2.push(productTypeObject);
    }
    console.log("cartCalculationProducts2: ",cartCalculationProducts2);
    res.status(200).json({
        products:cartCalculationProducts
    });
}