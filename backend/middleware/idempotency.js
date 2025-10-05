
const idempotencyCache = new Map();

const idempotencyCheck = async (req, res, next) => {
  if (req.method !== 'POST') {
    return next();
  }

  const idempotencyKey = req.header('Idempotency-Key');

  if (!idempotencyKey) {
    return next();
  }

  const cachedResponse = idempotencyCache.get(idempotencyKey);
  if (cachedResponse) {
    return res.status(cachedResponse.statusCode).json(cachedResponse.body);
  }


  const originalJson = res.json;
  res.json = (body) => {
    const responseToCache = {
      statusCode: res.statusCode,
      body,
    };
    idempotencyCache.set(idempotencyKey, responseToCache);
    
    setTimeout(() => {
        idempotencyCache.delete(idempotencyKey);
    }, 24 * 60 * 60 * 1000); 

    return originalJson.call(res, body);
  };

  next();
};

module.exports = idempotencyCheck;