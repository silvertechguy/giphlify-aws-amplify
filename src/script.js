import Amplify, { API, graphqlOperation } from "@aws-amplify/api";
import awsConfig from "./aws-exports";
import { createGif, updateGif, deleteGif } from "./graphql/mutations";
import { listGifs } from "./graphql/queries";

Amplify.configure(awsConfig);

let currentGifId = "";

const getGifs = async () => {
  const container = document.querySelector(".container");
  // reset its current contents
  container.innerHTML = "";

  const gifs = await API.graphql(graphqlOperation(listGifs));

  gifs.data.listGifs.items.map((gif) => {
    const img = document.createElement("img");
    img.setAttribute("src", gif.url);
    img.setAttribute("alt", gif.altText);

    img.addEventListener("click", () => {
      currentGifId = gif.id;

      document.getElementById("edit-modal").classList.remove("hidden");

      document.getElementById("edit-altText").value = gif.altText;
      document.getElementById("edit-url").value = gif.url;
      document.getElementById("edit-title").innerText = `Update ${gif.altText}`;
    });

    document.querySelector(".container").appendChild(img);
  });
};
// This function runs on page load that gets all the gifs and displays them
getGifs();

document
  .getElementById("plus-button")
  .addEventListener("click", () =>
    document.getElementById("create-modal").classList.remove("hidden")
  );

document.getElementById("close-create-button").addEventListener("click", () => {
  document.getElementById("create-modal").classList.add("hidden");
});

document.getElementById("close-edit-button").addEventListener("click", () => {
  document.getElementById("edit-modal").classList.add("hidden");
});

document.getElementById("create-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const gif = {
    altText: document.getElementById("altText").value,
    url: document.getElementById("url").value,
  };

  try {
    await API.graphql(graphqlOperation(createGif, { input: gif }));

    // Reset the form (make the fields blank again)
    document.getElementById("create-form").reset();
    // Re-Fetch all the gifs once we create a new one
    getGifs();

    document.getElementById("create-modal").classList.add("hidden");
  } catch (err) {
    console.error(err);
  }
});

document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const gif = {
    altText: document.getElementById("edit-altText").value,
    url: document.getElementById("edit-url").value,
  };

  try {
    await API.graphql(
      graphqlOperation(updateGif, {
        input: {
          id: currentGifId,
          ...gif,
        },
      })
    );
  } catch (err) {
    console.error(err);
  }

  getGifs();

  document.getElementById("edit-modal").classList.add("hidden");
});

document.getElementById("delete-button").addEventListener("click", async () => {
  try {
    await API.graphql(
      graphqlOperation(deleteGif, { input: { id: currentGifId } })
    );
  } catch (err) {
    console.error(err);
  }

  getGifs();

  document.getElementById("edit-modal").classList.add("hidden");
});
