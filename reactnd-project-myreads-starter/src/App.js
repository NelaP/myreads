import React from 'react'
import {
  Route
} from 'react-router-dom'

// APIs
import * as BooksAPI from './BooksAPI'

// Styling
import './App.css'

// UI
import BookList from './BookList'
import BookSearch from './BookSearch'


class BooksApp extends React.Component {

  state = {
    books: [],
    booksSearchResults: []
  }

  // Get all Books from API
  componentDidMount() {
    BooksAPI.getAll().then((books) => {
      this.setState({
        books
      })
    })
  }


  // Search API based on input Query
  // For each book returned we need to get the book shelf value
  // For each book shelf value we must add the object back to the searchQuery
  getSearchResults = (searchQuery) => {

    // If the user cleared the search, we don't need to show or process anything but simply update the state of the searchResults
    if (searchQuery === '') {

      this.setState(() => {
        return {
          booksSearchResults: []
        }
      })

    }

    // Search not Empty
    else {

      // Search the API. Then set state of BookSearchResults to used later
      BooksAPI.search(searchQuery)

        // Result Set returned of all books as per the search parameters
        .then(booksSearchResults => {
          return booksSearchResults
        })

        // THEN: Process the Search Results
        .then(booksSearchResults => {

          let responsePositive = true

          // Check if the response is not empty
          let resultsExist = booksSearchResults != null ? true : false
          if (!resultsExist) {
            responsePositive = false
            console.log("Results were undefined")
          }

          // If response was not empty we now need to check if response is VALID
          if (responsePositive) {
            let isValid = Object.entries(booksSearchResults)[0][0] === 'error' ? false : true
            if (!isValid) {
              responsePositive = false
              console.log("Invalid Search Paramters")
            }
          }

          // If response was not undefined nor was invalid we can continue
          // Process each book in the params          
          if (responsePositive) {

            // Get Book IDs for each book in Result Set
            let resultSet = booksSearchResults.map(b => b.id)
            let bookRequests = []

            // Fetch each book as per the ID and add to new BookRequests Object
            resultSet.forEach(function (b) {
              bookRequests.push(BooksAPI.get(b))
            })




            return Promise.all(bookRequests)
              .then(newResultSet => {
                ///Return the new ResultSet Object
                return newResultSet
              })
          }

          // console.log('books results empty')
          else {

            return booksSearchResults = []
          }

        })

        // Once completed we then set the state to update the UI
        .then(booksSearchResults => {

          this.setState(state => ({
            booksSearchResults
          }))
        })
    }

  } // End of getSearchResults



  // Update a Book and Change its shelf (DB and UI)
  onBookShelfChange = (bookChanged, newShelf) => {

    // Update the Database via the API
    // Then: Update the Books [] by fetching it again i.e. updates the state    
    BooksAPI.update(bookChanged, newShelf)

      .then(() => {
        BooksAPI.getAll().then((books) => {
          this.setState({
            books
          })
        })
      }) // END: .then Arrow Function
  }



  render() {

    return (

      <div>

        <Route exact path='/' render={() => (
          <BookList books={this.state.books}
            onBookShelfChange={this.onBookShelfChange}
          />
        )
        }
        />

        <Route path='/search' render={(history) => (<
          BookSearch booksSearchResults={this.state.booksSearchResults}
          onBookShelfChange={this.onBookShelfChange}
          getSearchResults={this.getSearchResults}
        />)
        } />

      </div>
    )
  }
}


export default BooksApp