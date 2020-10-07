import Amplify, { API, graphqlOperation } from "@aws-amplify/api";
import awsConfig from "./aws-exports";

import { createGif, deleteGif, updateGif } from "./graphql/mutations";
import { listGifs } from "./graphql/queries";

Amplify.configure(awsConfig);

let currentGifId = "";

const createNewGif = async (e) => {
  e.preventDefault(); // don't refresh the page after form submit

  const gif = {
    // grab value of the `altText` field
    altText: document.getElementById("altText").value,
    // grab the value of the `url` field
    url: document.getElementById("url").value,
  };

  try {
    // Make the API request: provide the createGif operation, provide the user's gif data
    const newGif = await API.graphql(
      graphqlOperation(createGif, { input: gif })
    );
    // Print the data to the console once it comes back
    console.log(newGif);
    // fetch all gifs once a new is created
    getGifs();
    // Reset the form (make fields blank again)
    document.getElementById("create-form").reset();
  } catch (err) {
    // If the request fails, print the error message to the console
    console.error(err);
  }
};

const getGifs = async () => {
  // select the container element
  const container = document.querySelector(".container");
  // reset its current contents
  container.innerHTML = "";
  // make a request to get all our gifs
  const gifs = await API.graphql(graphqlOperation(listGifs));
  // loop through our gifs and
  gifs.data.listGifs.items.map((gif) => {
    // create a new image element
    const img = document.createElement("img");
    // add the src attribute to the img
    img.setAttribute("src", gif.url);
    // add the alt attribute to the img
    img.setAttribute("alt", gif.altText);
    // track when a user clicks a gif image
    img.addEventListener("click", () => {
      // grab the current gif ID
      currentGifId = gif.id;
      document.getElementById("edit-altText").value = gif.altText;
      document.getElementById("edit-url").value = gif.url;
      document.getElementById("edit-title").innerText = `Update ${gif.altText}`;
    });
    // add the image to the container
    document.querySelector(".container").appendChild(img);
  });
};

// Submit edited data to graphql
const editGif = async (e) => {
  e.preventDefault();

  try {
    await API.graphql(
      graphqlOperation(updateGif, {
        input: {
          id: currentGifId,
          altText: document.getElementById("edit-altText").value,
          url: document.getElementById("edit-url").value,
        },
      })
    );
  } catch (err) {
    console.error(err);
  }
  getGifs();
};

const removeGif = async () => {
  await API.graphql(
    graphqlOperation(deleteGif, {
      input: {
        id: currentGifId,
      },
    })
  );
  getGifs();
};

document.getElementById("delete-button").addEventListener("click", removeGif);

document.getElementById("edit-form").addEventListener("submit", editGif);

// run this function on page load
getGifs();

// run the createNewGif function when the form is submitted
document.getElementById("create-form").addEventListener("submit", createNewGif);
