exports.handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ 
      ok: true,
      message: 'Test function works!',
      timestamp: new Date().toISOString()
    })
  };
};
