pragma solidity ^0.5.0;

contract BookComments {
    string[] public comments;
    mapping(uint => uint[]) private bookComments;

    function addComment(uint bookId, string memory comment) public {
        comments.push(comment);
        uint commentId = comments.length - 1;
        bookComments[bookId].push(commentId);
    }

    function getCommentIds(uint bookId) public view returns (uint[] memory) {
        return bookComments[bookId];
    }
}