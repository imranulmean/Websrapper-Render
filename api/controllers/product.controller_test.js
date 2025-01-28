import { AldiCollection, ColesCollection, WoolsCollection, IgaCollection, AusiCollection, 
    ColesCollection2, WoolsCollection2, IgaCollection2   } from '../models/product.model.js';
import Categories from '../models/categories.model.js';
import {getPredictedCategories} from './predictedCategories.js';
import { errorHandler } from '../utils/error.js';

let predictedCategories=[];


function getSimilarProducts_DiffShop_ProductType_Weights_Brand_productPrice(pTitle){
    let brandName=pTitle.split(' ')[0];
    brandName=brandName.split("-")[0];
    var weightMatch = pTitle.match(/(\d+(\.\d+)?(kg|L|gm|g|ml))/i);
    var weight = weightMatch ? weightMatch[1] : null;
  
    // Initialize packSize
    let packSize = null;

    // Check for pack size in both possible formats (before and after the weight)
    const packSizeMatch = pTitle.match(/(\d+)\s*[xX]\s*\d+(\.\d+)?(kg|L|gm|g|ml)|(\d+(\.\d+)?(kg|L|gm|g|ml))\s*[xX]\s*(\d+)/i);
    if (packSizeMatch) {
        // If match found, determine which group captures pack size
        packSize = packSizeMatch[1] || packSizeMatch[7];
    } else {
        // Look for "pack", "Pack", or "packs" if "x" is not found
        const alternatePackSizeMatch = pTitle.match(/(\d+\s*(?:pack|Pack|packs))/i);
        if (alternatePackSizeMatch) {
            packSize = alternatePackSizeMatch[1];
        }
    }
    return { weight, brandName, packSize };
}


///////////////////////This is Testing Phase ////////////////////////
function normalizeTitle(title, brandName, packSize, weight) {
    let normalizedTitle = title;

    // Check if the first word is in the form of "word - word" (e.g., "Coca - Cola")
    const firstWordMatch = normalizedTitle.match(/^(\w+)\s*-\s*(\w+)/);
    if (firstWordMatch) {
        // Combine both parts of the first word into a single word (e.g., "Coca - Cola" -> "Coca-Cola")
        const combinedBrand = `${firstWordMatch[1]}-${firstWordMatch[2]}`;
        // Replace the first word with the combined version
        normalizedTitle = normalizedTitle.replace(firstWordMatch[0], combinedBrand);
        // Now remove the brand name from the title, as you want to remove it entirely if it's the first word
        normalizedTitle = normalizedTitle.replace(combinedBrand, "").trim();
    }

    // Handle removal of full brand name
    if (brandName) {
        // Normalize brand name for consistency
        brandName = brandName.replace(/\s*-\s*/g, "-"); // Convert "Coca - Cola" to "Coca-Cola"

        // Remove brand name completely if present
        const brandRegex = new RegExp(`\\b${brandName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
        normalizedTitle = normalizedTitle.replace(brandRegex, "");
    }

    // Remove combined formats like "24x375mL" and "375mLx24"
    if (packSize && weight) {
        const combinedRegex = new RegExp(
            `\\b(${packSize}\\s*[xX]\\s*${weight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${weight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[xX]\\s*${packSize})\\b`,
            "gi"
        );
        normalizedTitle = normalizedTitle.replace(combinedRegex, "");
    }

    // Remove standalone packSize if present
    if (packSize) {
        const packSizeRegex = new RegExp(`\\b${packSize.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, "gi");
        normalizedTitle = normalizedTitle.replace(packSizeRegex, "");
    }

    // Remove standalone weight if present
    if (weight) {
        const weightRegex = new RegExp(`\\b\\d+(\\.\\d+)?(kg|L|gm|g|ml)\\b`, "gi");
        normalizedTitle = normalizedTitle.replace(weightRegex, "");
    }

    // Remove standalone "X", "x", and "X" followed by numbers or letters
    normalizedTitle = normalizedTitle.replace(/\b[xX](\d*\w*)?\b/gi, ""); // Matches "X", "x", "X24", "x24", etc.

    // Remove variations of "Pack"
    normalizedTitle = normalizedTitle.replace(/\b(pack|Pack|packs|Packs)\b/gi, "");

    // Remove special characters like "|"
    normalizedTitle = normalizedTitle.replace(/[\|]/g, "");

    // Clean up extra spaces and trim
    return normalizedTitle.replace(/\s+/g, " ").trim();
}

function tokenizeTitle(normalizedTitle) {
    return normalizedTitle.toLowerCase().split(/\s+/); // Tokenize by spaces and make everything lowercase
}

function calculateMatchingPercentage(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    // Find the intersection (matching tokens)
    const intersection = [...set1].filter(token => set2.has(token));
    const union = new Set([...set1, ...set2]);
    // Calculate the percentage of matching tokens
    const matchingPercentage = (intersection.length / union.size) * 100;

    return matchingPercentage;
}

// Function to compare titles and return matching percentage
function compareTitlesAndGetPercentage(title1, title2) {
    const tokens1 = tokenizeTitle(title1);
    const tokens2 = tokenizeTitle(title2);

    // Calculate the matching percentage
    return calculateMatchingPercentage(tokens1, tokens2);
}

async function getSimilarProducts_DiffShop_Engine(pTitle,collectionName, pPrice, shop){
    try { 
    const { weight , brandName, packSize} =  getSimilarProducts_DiffShop_ProductType_Weights_Brand_productPrice(pTitle);

    let query = { $and:[] };
    query.$and.push({ brandName: { $regex: brandName, $options: "i" } });
    query.$and.push({ shop: { $ne: shop } });
    query.$and.push({ productPrice: { $lt: pPrice } });
        if (packSize && weight) {

            const weightRegex = weight.replace(/ml|l|kg|g|x/gi, match => `[${match.toLowerCase()}${match.toUpperCase()}]`);
            const packSizeRegex = packSize.replace(/x/gi, '[xX]'); // Handle lowercase/uppercase "x"
        
            query.$and.push({
                $or: [
                    {
                        $and: [
                            { productTitle: { $regex: `${weightRegex}`, $options: "i" } }, // Flexible match for weight
                            { productTitle: { $regex: `${packSizeRegex}`, $options: "i" } } // Flexible match for packSize
                        ]
                    },
                    { productTitle: { $regex: `${packSizeRegex}`, $options: "i" } } // Flexible match for only packSize
                ]
            });            
        } 
        else if (packSize) {
            // Normalize packSize to handle variations like "x10", "X10", or "10 Pack"
            const packSizeRegex = packSize.replace(/x/gi, '[xX]'); // Handle lowercase/uppercase "x"
            query.$and.push({ productTitle: { $regex: `${packSizeRegex}`, $options: "i" } });
        } else if (weight) {
            // Normalize weight to handle variations like "375mL", "375ml", "375ML"
            const weightRegex = weight.replace(/ml|l|kg|g|x/gi, match => `[${match.toLowerCase()}${match.toUpperCase()}]`);
            query.$and.push({ productTitle: { $regex: `${weightRegex}`, $options: "i" } });
        }
        // Ensure that irrelevant products with neither weight nor packSize are excluded
        if (!weight && !packSize) {
            throw new Error("No valid weight or packSize found for the query.");
        } 
   //////////////////////////////////////
    let products = await collectionName.find(query);
    let filteredProducts=[];

    const { weight: firstWeight, brandName: firstBrandName, packSize: firstPackSize } = getSimilarProducts_DiffShop_ProductType_Weights_Brand_productPrice(pTitle);
    const normalizedTitle0 = normalizeTitle(pTitle, firstBrandName, firstPackSize, firstWeight);
    
    for(let product of products){
        product= product.toObject();
        const { weight:w2, brandName:b2, packSize:p2 } = getSimilarProducts_DiffShop_ProductType_Weights_Brand_productPrice(product.productTitle);
        const normalizedTitle = normalizeTitle(product.productTitle, b2, p2, w2);        
        // product.productTitle=product.productTitle.replace(" |",'');
        let matched= compareTitlesAndGetPercentage(normalizedTitle0, normalizedTitle);
        product.matched=matched.toFixed(2);
        if(matched>=60){            
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

