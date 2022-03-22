function createErrorResponse(message , code){
  return {
    error : message, 
    code
  }
}

module.exports = {
  createErrorResponse
}