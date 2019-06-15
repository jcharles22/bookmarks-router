

  function makeBookmarkArray() {
    return [
        {
            description: "Think outside the classroom",
            id: 1,
            rating: 5,
            title: "Thinkful",
            url: "https://www.thinkful.com"
        },
        {
            description: "Where we find everything else",
            id: 2,
            rating: 4,
            title: "Google",
            url: "https://www.google.com"
        },
        {
            description: "The only place to find web documentation",
            id: 3,
            rating: 5,
            title: "MDN",
            url: "https://developer.mozilla.org" 
        }
    ]
  }
  
  module.exports = {
    makeBookmarkArray,
  }