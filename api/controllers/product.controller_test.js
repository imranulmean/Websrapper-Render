import { AldiCollection, ColesCollection, WoolsCollection, IgaCollection, AusiCollection, 
    ColesCollection2, WoolsCollection2, IgaCollection2   } from '../models/product.model.js';
import Categories from '../models/categories.model.js';
import {getPredictedCategories} from './predictedCategories.js';
import { errorHandler } from '../utils/error.js';

let predictedCategories=[];

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


///////////////////////This is Testing Phase ////////////////////////
async function getSimilarProducts_DiffShop_Engine(pTitle,collectionName, pPrice, shop){
    try { 
    const {productType, weight , brandName, packSize} = await getSimilarProducts_DiffShop_ProductType_Weights_Brand_productPrice(pTitle);
    let query = {};
    query.productTitle = { $regex: weight, $options: "i" };
    query.brandName=brandName;
    query.shop={$ne:shop};

    let products = await collectionName.find(query);
    let filteredProducts=[];
    for(let product of products){
        product= product.toObject();
        product.productTitle=product.productTitle.replace(" |",'');
        let matched= calculateMatchingPercentage(pTitle, product.productTitle);
        if(matched>=50){
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
export const getSimilarProducts_DiffShop =async (req, res, next) =>{
    try {
        let combinedProducts;
        let {productTitle, productPrice, shop}=req.body;
        productTitle=productTitle.replace(" |",'');
        const [ausiProducts, colesProducts, woolsProducts, igaProducts,
            colesProducts2, woolsProducts2, igaProducts2] = await Promise.all([
                getSimilarProducts_DiffShop_Engine(productTitle, AusiCollection, productPrice, shop),
                getSimilarProducts_DiffShop_Engine(productTitle, ColesCollection, productPrice, shop),
                getSimilarProducts_DiffShop_Engine(productTitle, WoolsCollection, productPrice, shop),
                getSimilarProducts_DiffShop_Engine(productTitle, IgaCollection, productPrice, shop),
                getSimilarProducts_DiffShop_Engine(productTitle, ColesCollection2, productPrice, shop),
                getSimilarProducts_DiffShop_Engine(productTitle, WoolsCollection2, productPrice, shop),
                getSimilarProducts_DiffShop_Engine(productTitle, IgaCollection2, productPrice, shop)
    ]);
        combinedProducts = ausiProducts.products.concat(colesProducts.products, woolsProducts.products, igaProducts.products,
                                                            colesProducts2.products, woolsProducts2.products, igaProducts2.products);
        res.status(200).json({
        products:combinedProducts
        })
    } 
    catch (error) {
        console.log(error)
        next(error)
    }
}

