// This file manages the reader dashboard functionalities, such as displaying purchased books and handling user interactions.

document.addEventListener("DOMContentLoaded", function () {
    const booksRow = document.querySelector(".books-row");
    const purchasedBooks = [
        {
            title: "The Great Gatsby",
            author: "F. Scott Fitzgerald",
            cover: "path/to/gatsby-cover.jpg"
        },
        {
            title: "1984",
            author: "George Orwell",
            cover: "path/to/1984-cover.jpg"
        },
        {
            title: "Pride and Prejudice",
            author: "Jane Austen",
            cover: "path/to/pride-prejudice-cover.jpg"
        },
        {
            title: "The Hobbit",
            author: "J.R.R. Tolkien",
            cover: "path/to/hobbit-cover.jpg"
        },
        {
            title: "Dune",
            author: "Frank Herbert",
            cover: "path/to/dune-cover.jpg"
        },
        {
            title: "The Alchemist",
            author: "Paulo Coelho",
            cover: "path/to/alchemist-cover.jpg"
        }
    ];

    function displayPurchasedBooks() {
        purchasedBooks.forEach(book => {
            const bookElement = document.createElement("div");
            bookElement.classList.add("purchased-book");
            bookElement.innerHTML = `
                <div class="book-cover-img" style="background-image: url('${book.cover}');"></div>
                <h4>${book.title}</h4>
                <p>${book.author}</p>
            `;
            booksRow.appendChild(bookElement);
        });
    }

    displayPurchasedBooks();
});