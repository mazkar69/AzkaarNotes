// ============================================
// Slug Generator - URL Safe String Conversion
// ============================================

/**
 * Convert string to URL-friendly slug
 * @param {string} text - Text to convert
 * @param {Object} options - Configuration options
 * @returns {string} URL-safe slug
 */
export const slugify = (text, options = {}) => {
    const {
        lowercase = true,
        separator = "-",
        maxLength = 100,
        strict = false, // If true, remove all non-alphanumeric
    } = options;

    if (!text || typeof text !== "string") {
        return "";
    }

    let slug = text
        .toString()
        .trim()
        // Remove accents/diacritics
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        // Replace spaces with separator
        .replace(/\s+/g, separator)
        // Remove special characters (keep alphanumeric and separator)
        .replace(new RegExp(`[^a-zA-Z0-9${separator}]`, "g"), "")
        // Replace multiple separators with single
        .replace(new RegExp(`${separator}+`, "g"), separator)
        // Remove leading/trailing separator
        .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");

    if (lowercase) {
        slug = slug.toLowerCase();
    }

    if (strict) {
        slug = slug.replace(new RegExp(`[^a-zA-Z0-9${separator}]`, "g"), "");
    }

    // Truncate to maxLength
    if (slug.length > maxLength) {
        slug = slug.substring(0, maxLength);
        // Remove trailing separator after truncation
        slug = slug.replace(new RegExp(`${separator}$`), "");
    }

    return slug;
};

/**
 * Generate unique slug with suffix
 * @param {string} text - Text to convert
 * @param {Function} checkExists - Async function to check if slug exists
 * @returns {string} Unique slug
 */
export const generateUniqueSlug = async (text, checkExists) => {
    let slug = slugify(text);
    let uniqueSlug = slug;
    let counter = 1;

    while (await checkExists(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
};

/**
 * Slug with timestamp for uniqueness
 * @param {string} text - Text to convert
 * @returns {string} Slug with timestamp
 */
export const slugifyWithTimestamp = (text) => {
    const slug = slugify(text);
    const timestamp = Date.now().toString(36); // Base36 for shorter string
    return `${slug}-${timestamp}`;
};

/**
 * Slug with random suffix
 * @param {string} text - Text to convert
 * @param {number} suffixLength - Length of random suffix
 * @returns {string} Slug with random suffix
 */
export const slugifyWithRandom = (text, suffixLength = 6) => {
    const slug = slugify(text);
    const randomSuffix = Math.random()
        .toString(36)
        .substring(2, 2 + suffixLength);
    return `${slug}-${randomSuffix}`;
};

/**
 * Convert slug back to readable text
 * @param {string} slug - Slug to convert
 * @param {string} separator - Separator used in slug
 * @returns {string} Readable text
 */
export const unslugify = (slug, separator = "-") => {
    if (!slug || typeof slug !== "string") {
        return "";
    }

    return slug
        .split(separator)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// ============================================
// Examples of Slug Conversions
// ============================================
/*
slugify("Hello World!")                    // "hello-world"
slugify("  React JS Tutorial  ")           // "react-js-tutorial"
slugify("Café & Résumé")                   // "cafe-resume"
slugify("Product Price: $99.99!")          // "product-price-9999"
slugify("Node.js Best Practices")          // "nodejs-best-practices"
slugify("What is AI/ML?")                  // "what-is-aiml"
slugify("Title", { separator: "_" })       // "title"
slugify("UPPER CASE", { lowercase: false }) // "UPPER-CASE"

slugifyWithTimestamp("blog post")          // "blog-post-lqz5k8m"
slugifyWithRandom("product")               // "product-x7k2m9"
unslugify("hello-world")                   // "Hello World"
*/

// ============================================
// Usage with MongoDB
// ============================================
/*
import { generateUniqueSlug } from "./slugify.js";
import Product from "../models/Product.js";

const createProduct = async (req, res) => {
  const { title } = req.body;

  // Generate unique slug
  const slug = await generateUniqueSlug(title, async (slug) => {
    const exists = await Product.findOne({ slug });
    return !!exists;
  });

  const product = await Product.create({
    title,
    slug,
    ...req.body
  });

  res.status(201).json({ success: true, data: product });
};
*/

export default slugify;
