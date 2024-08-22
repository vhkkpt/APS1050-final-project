App = {
  web3Provider: null,
  contracts: {},

  init: async function () {
    return await App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User denied account access")
      }
    } else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function () {
    $.getJSON('BookStore.json', function (data) {
      var BookStoreArtifact = data;
      App.contracts.BookStore = TruffleContract(BookStoreArtifact);
      App.contracts.BookStore.setProvider(App.web3Provider);
      return App.showBooksByCategory($('#categorySelect').val());
    });

    $.getJSON('BookComments.json', function (data) {
      var BookCommentsArtifact = data;
      App.contracts.BookComments = TruffleContract(BookCommentsArtifact);
      App.contracts.BookComments.setProvider(App.web3Provider);
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', '.btn-buy', App.handleBuy);
    $(document).on('change', '#categorySelect', App.handleCategoryChange);
    $(document).on('click', '.like-link', App.handleLike);
    $(document).on('change', '#sortBySelect', App.handleSortByChange);
    $(document).on('click', '.btn-comment', App.handleComment);
    $(document).on('click', '#submitComment', App.submitComment);
  },

  showBooksByCategory: function (category) {
    var bookStoreInstance;
    App.contracts.BookStore.deployed().then(function(instance) {
      bookStoreInstance = instance;
      return bookStoreInstance.getIdsByCategory.call(category);
    }).then(async function (bookIds) {
      var booksRow = $('#booksRow');
      var bookTemplate = $('#bookTemplate');
      booksRow.empty();
      for (i = 0; i < bookIds.length; i++) {
        bookStoreInstance.books(bookIds[i].toNumber()).then(function(book) {
          var id = book[0];
          var title = book[1];
          var author = book[2];
          var category = book[3];
          var price = book[4];
          var buyer = book[5];
          var likes = book[6];

          bookTemplate.find('.panel-title').text(title);
          bookTemplate.find('.book-price').text(price);
          bookTemplate.find('.book-author').text(author);
          bookTemplate.find('.book-id').text(id);
          bookTemplate.find('.book-category').text(category);
          bookTemplate.find('.book-likes').text(likes);
          bookTemplate.find('.book-likes').attr('data-id', id);
          bookTemplate.find('.btn-buy').attr('data-id', id);
          bookTemplate.find('.btn-buy').attr('data-price', price);
          bookTemplate.find('.btn-comment').attr('data-id', id);
          bookTemplate.find('div').attr('data-id', id);
          bookTemplate.find('div').attr('data-likes', likes);
          bookTemplate.find('div').attr('data-price', price);
          if (buyer !== '0x0000000000000000000000000000000000000000') {
            bookTemplate.find('.btn-buy').text('Sold').attr('disabled', true);
            bookTemplate.find('.book-owner').text(buyer);
          } else {
            bookTemplate.find('.btn-buy').text('Buy').attr('disabled', false);
            bookTemplate.find('.book-owner').text('Seller');
          }

          booksRow.append(bookTemplate.html());
        });
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  handleBuy: function (event) {
    event.preventDefault();
    var bookId = parseInt($(event.target).data('id'));
    var bookPrice = parseInt($(event.target).data('price'));
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.BookStore.deployed().then(function (instance) {
        return instance.buyBook(bookId, { from: account, value: bookPrice });
      }).then(function (result) {
        alert("Purchase Success!");
        App.showBooksByCategory($('#categorySelect').val());
      }).catch(function (err) {
        alert("Failed to purchase the book!");
        console.error(err);
      });
    });
  },

  handleLike: function (event) {
    event.preventDefault();
    var bookId = parseInt($(event.target).data('id'));
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.BookStore.deployed().then(function (instance) {
        return instance.likeBook(bookId, { from: account });
      }).then(function (result) {
        alert("Like Success!");
        App.showBooksByCategory($('#categorySelect').val());
      }).catch(function (err) {
        alert("Failed to like this book!");
        console.error(err);
      });
    });
  },

  handleComment: function (event) {
    var commentInstance;
    var bookId = $(event.target).data('id');
    $('#commentModal').data('id', bookId);
    $('#commentList').empty();

    App.contracts.BookComments.deployed().then(function (instance) {
      commentInstance = instance;
      return commentInstance.getCommentIds.call(bookId);
    }).then(function (commentIds) {
      if (commentIds.length > 0) {
        commentIds.forEach(function (id) {
          commentInstance.comments(id.toNumber()).then(function (comment) {
            $('#commentList').append(`<li class="list-group-item">${comment}</li>`);
          });
        });
      }
    }).catch(function (err) {
      console.log(err.message);
    });
  },

  submitComment: function () {
    var commentInstance;
    var comment = $('#newComment').val();
    if (comment.trim() === '') {
      alert('Comment cannot be empty!');
      return;
    }
    var bookId = $('#commentModal').data('id');
    web3.eth.getAccounts(function (error, accounts) {
      if (error) {
        console.log(error);
        return;
      }
      var account = accounts[0];
      App.contracts.BookComments.deployed().then(function (instance) {
        commentInstance = instance;
        return commentInstance.addComment(bookId, comment, { from: account });
      }).then(function (result) {
        alert('Comment added!');
        $('#newComment').val('');
        commentInstance.getCommentIds.call(bookId).then(function (ids) {
          var lastCommentId = ids[ids.length - 1];
          commentInstance.comments(lastCommentId.toNumber()).then(function (lastComment) {
            $('#commentList').append(`<li class="list-group-item">${lastComment}</li>`);
          });
        });
      }).catch(function (err) {
        alert('Failed to add comment!');
        console.error(err);
      });
    });
  },

  addBook: function (title, author, category, price) {
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      App.contracts.BookStore.deployed().then(function (instance) {
        return instance.addBook(title, author, category, price, { from: account });
      }).then(function (result) {
        alert("Book added!");
        App.showBooksByCategory($('#categorySelect').val());
      }).catch(function (err) {
        alert("Failed to add the book!");
        console.error(err);
      });
    });
  },

  handleCategoryChange: function () {
    var category = $('#categorySelect').val();
    App.showBooksByCategory(category);
  },

  handleSortByChange: function () {
    var key = $('#sortBySelect').val();
    var $books = $('#booksRow');
    var $booksList = $books.children('div');

    $booksList.sort(function(a, b) {
      if (key === 'ID') {
        return parseInt($(a).data('id')) - parseInt($(b).data('id'));
      } else if (key === 'Price') {
        return parseInt($(a).data('price')) - parseInt($(b).data('price'));
      } else if (key === 'Likes') {
        return parseInt($(b).data('likes')) - parseInt($(a).data('likes'));
      }
    });

    $books.empty().append($booksList);
  }
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
