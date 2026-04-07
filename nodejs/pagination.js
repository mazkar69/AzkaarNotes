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


