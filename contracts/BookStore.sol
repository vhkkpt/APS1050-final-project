pragma solidity ^0.5.0;

contract BookStore {
    address payable constant recipient = 0xc01b0b53095232c026b40B6521e37F76634E4f80;

    struct Book {
        uint id;
        string title;
        string author;
        string category;
        uint price;
        address payable buyer;
        uint likes;
    }

    Book[] public books;
    mapping(string => uint[]) public IdsByCategory;
    uint private currentBookId = 0;

    function addBook(string memory _title, string memory _author, string memory _category, uint _price) public {
        books.push(Book(currentBookId, _title, _author, _category, _price, address(0), 0));
        IdsByCategory[_category].push(currentBookId);
        IdsByCategory[""].push(currentBookId);
        currentBookId++;
    }

    function likeBook(uint _id) public {
        require(_id < books.length, "Book does not exist");
        books[_id].likes += 1;
    }

    function getIdsByCategory(string memory _category) public view returns (uint[] memory) {
        return IdsByCategory[_category];
    }

    function buyBook(uint _id) public payable {
        require(_id < books.length, "Book does not exist");
        Book storage book = books[_id];
        require(book.buyer == address(0), "Book is already sold");
        require(msg.value >= book.price, "Insufficient funds sent");
        book.buyer = msg.sender;

        recipient.transfer(msg.value);
    }
}
