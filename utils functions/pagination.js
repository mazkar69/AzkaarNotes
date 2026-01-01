// ============================================
// MongoDB Pagination Helper
// ============================================

/**
 * Paginate MongoDB query results
 * @param {Model} model - Mongoose model
 * @param {Object} query - MongoDB query filter
 * @param {Object} options - Pagination options
 * @returns {Object} Paginated results with metadata
 */
export const paginateMongo = async (model, query = {}, options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = options.sort || { createdAt: -1 };
    const select = options.select || "";
    const populate = options.populate || "";

    const [data, totalDocs] = await Promise.all([
        model
            .find(query)
            .select(select)
            .populate(populate)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        model.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalDocs,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
    };
};

// ============================================
// MongoDB Aggregation Pagination
// ============================================

/**
 * Paginate MongoDB aggregation results
 * @param {Model} model - Mongoose model
 * @param {Array} pipeline - Aggregation pipeline
 * @param {Object} options - Pagination options
 * @returns {Object} Paginated results with metadata
 */
export const paginateAggregate = async (model, pipeline = [], options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const skip = (page - 1) * limit;

    // Add pagination stages to pipeline
    const paginatedPipeline = [
        ...pipeline,
        {
            $facet: {
                data: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        },
    ];

    const result = await model.aggregate(paginatedPipeline);
    const data = result[0]?.data || [];
    const totalDocs = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalDocs,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
    };
};

// ============================================
// MySQL/SQL Pagination Helper
// ============================================

/**
 * Generate SQL pagination query parts
 * @param {Object} options - Pagination options
 * @returns {Object} SQL pagination parts
 */
export const paginateSQL = (options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const offset = (page - 1) * limit;

    return {
        limit,
        offset,
        // For raw SQL: LIMIT ${limit} OFFSET ${offset}
        clause: `LIMIT ${limit} OFFSET ${offset}`,
    };
};

/**
 * Build SQL pagination response
 * @param {Array} data - Query results
 * @param {Number} totalDocs - Total count
 * @param {Object} options - Pagination options
 * @returns {Object} Paginated response
 */
export const buildSQLPaginationResponse = (data, totalDocs, options = {}) => {
    const page = parseInt(options.page) || 1;
    const limit = parseInt(options.limit) || 10;
    const totalPages = Math.ceil(totalDocs / limit);

    return {
        success: true,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalDocs,
            limit,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            nextPage: page < totalPages ? page + 1 : null,
            prevPage: page > 1 ? page - 1 : null,
        },
    };
};

// ============================================
// Usage Examples
// ============================================
/*
// MongoDB Example
import User from "../models/User.js";
import { paginateMongo } from "./pagination.js";

const getUsers = async (req, res) => {
  const { page, limit, search } = req.query;
  
  const query = search 
    ? { name: { $regex: search, $options: "i" } } 
    : {};
  
  const result = await paginateMongo(User, query, {
    page,
    limit,
    sort: { createdAt: -1 },
    select: "name email avatar",
    populate: "role",
  });
  
  res.json(result);
};

// MySQL Example with mysql2
import pool from "../config/db.js";
import { paginateSQL, buildSQLPaginationResponse } from "./pagination.js";

const getProducts = async (req, res) => {
  const { page, limit } = req.query;
  const { limit: sqlLimit, offset } = paginateSQL({ page, limit });
  
  // Get paginated data
  const [rows] = await pool.query(
    `SELECT * FROM products ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [sqlLimit, offset]
  );
  
  // Get total count
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM products`);
  
  const result = buildSQLPaginationResponse(rows, total, { page, limit });
  res.json(result);
};
*/
