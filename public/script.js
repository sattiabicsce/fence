const getCars = async () => {
    try {
        return (await fetch("/api/cars")).json();
    } catch (error) {
        console.error(error);
    }
}

const showCars = async () => {
    let cars = await getCars();
    let carsDiv = document.getElementById("car-list");
    carsDiv.classList.add("flex-container");
    carsDiv.classList.add("wrap");
    carsDiv.innerHTML = "";

    cars.forEach((car) => {
        const section = document.createElement("section");
        section.classList.add("car-model");
        carsDiv.append(section);

        const a = document.createElement("a");
        a.href = "#";
        section.append(a);

        const h3 = document.createElement("h3");
        h3.innerHTML = car.make + " " + car.model;
        a.append(h3);

        const img = document.createElement("img");
        img.src = car.img;
        section.append(img);

        a.onclick = (e) => {
            e.preventDefault();
            document.getElementById("hide-details").classList.remove("hidden");
            displayDetails(car);
        };

        const editButton = document.createElement("button");
        editButton.innerHTML = "Edit";
        section.append(editButton);

        editButton.onclick = (e) => {
            e.preventDefault();
            document.querySelector(".dialog").classList.remove("transparent");
            document.getElementById("add-edit").innerHTML = "Edit Fence Details";
            populateEditForm(car);
        };

        const deleteButton = document.createElement("button");
        deleteButton.innerHTML = "Delete";
        section.append(deleteButton);

        deleteButton.onclick = async (e) => {
            e.preventDefault();
            const confirmation = window.confirm("Are you sure you want to delete this car?");
            if (confirmation) {
                await deleteCar(car);
            }
        };
    });
};

const displayDetails = (car) => {
    const carDetails = document.getElementById("car-details");
    carDetails.innerHTML = "";
    carDetails.classList.add("flex-container");

    const h3 = document.createElement("h3");
    h3.innerHTML = car.make + " " + car.model;
    carDetails.append(h3);
    h3.classList.add("pad-this");

    const p1 = document.createElement("p");
    carDetails.append(p1);
    p1.innerHTML = 'Year: ' + car.year;
    p1.classList.add("pad-this");

    const p2 = document.createElement("p");
    carDetails.append(p2);
    p2.innerHTML = 'Type: ' + car.type;
    p2.classList.add("pad-this");

    const ul = document.createElement("ul");
    carDetails.append(ul);
    ul.classList.add("pad-this");

    car.features.forEach((feature) => {
        const li = document.createElement("li");
        ul.append(li);
        li.innerHTML = feature;
    });

    const editButton = document.createElement("button");
    editButton.innerHTML = "Edit";
    carDetails.append(editButton);

    editButton.onclick = (e) => {
        e.preventDefault();
        document.querySelector(".dialog").classList.remove("transparent");
        document.getElementById("add-edit").innerHTML = "Edit Fence Details";
    };

    populateEditForm(car);
};

const deleteCar = async (car) => {
    let response = await fetch(`/api/cars/${car._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
      });
    
      if (response.status != 200) {
        console.log("error deleting");
        return;
      }
    
      let result = await response.json();
      showCars();
      document.getElementById("car-details").innerHTML = "";
      resetForm();
};

const populateEditForm = (car) => {
    const form = document.getElementById("car-form");
    console.log(car._id);
    form._id.value = car._id;
    form.make.value = car.make;
    form.model.value = car.model;
    form.year.value = car.year;
    form.type.value = car.type;

    document.getElementById("feature-boxes").innerHTML = "";

    car.features.forEach((feature) => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = feature;
        document.getElementById("feature-boxes").appendChild(input);
    });
};

const addEditCar = async (e) => {
    e.preventDefault();
    const form = document.getElementById("car-form");
    const formData = new FormData(form);
    const dataStatus = document.getElementById("data-status");
    let response;
    formData.append("features", getFeatures());

    if (form._id.value == -1) {
        formData.delete("_id");
        console.log(formData);
        response = await fetch("/api/cars", {
            method: "POST",
            body: formData
        });
    } else {
        console.log(...formData);

        response = await fetch(`/api/cars/${form._id.value}`, {
            method: "PUT",
            body: formData
        });
    }

    if (response.status !== 200) {
        dataStatus.classList.remove("hidden");
        dataStatus.innerHTML = "Error Posting Data!";
        setTimeout(() => {
            dataStatus.classList.add("hidden");
        }, 3000);
        console.error("Error posting data");
        // console.error(response.status);
        return;
    }

    car = await response.json();

    if (form._id.value != -1) {
        displayDetails(car);
      }

    resetForm();
    document.querySelector(".dialog").classList.add("transparent");
    showCars();
};

const getFeatures = () => {
    const inputs = document.querySelectorAll("#feature-boxes input");
    let features = [];

    inputs.forEach((input) => {
        features.push(input.value);
    });

    return features;
}

const resetForm = () => {
    const form = document.getElementById("car-form");
    form.reset();
    form._id.value = "-1";
    document.getElementById("feature-boxes").innerHTML = "";
};

const showHideAdd = (e) => {
    e.preventDefault();
    document.querySelector(".dialog").classList.remove("transparent");
    document.getElementById("add-edit").innerHTML = "Add Fence";
    resetForm();
};

const addFeature = (e) => {
    e.preventDefault();
    const section = document.getElementById("feature-boxes");
    const input = document.createElement("input");
    input.type = "text";
    section.append(input);
}

window.onload = () => {
    showCars();
    document.getElementById("car-form").onsubmit = addEditCar;
    document.getElementById("add-link").onclick = showHideAdd;

    document.querySelector(".close").onclick = () => {
        document.querySelector(".dialog").classList.add("transparent");
    };

    document.getElementById("add-feature").onclick = addFeature;
};

// JavaScript to handle hamburger menu toggle

const hamburgerMenu = document.querySelector('.hamburger-menu');
const mainNav = document.getElementById('mainNav');

hamburgerMenu.addEventListener('click', () => {
    mainNav.classList.toggle('show');
});

// JS for contact form
const showEmailResult = async (e) => {
    e.preventDefault();
    const result = document.getElementById("result");
    let response = await getEmailResult();
    if (response.status == 200) {
        result.innerHTML = "Email Successfully Sent";
    } else {
        result.innerHTML = "Sorry, your email was not sent.";
    }
};

const getEmailResult = async () => {
    const form = document.getElementById("contact-form");
    const formData = new FormData(form);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: json,
        });
        return response;
    } catch (error) {
        console.error(error);
        document.getElementById("result").innerHTML = "Sorry, your email couldn't be sent";
    }
};

document.getElementById("contact-form").onsubmit = showEmailResult;

/*JS for Reviews
document.getElementById("review-form").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get form data
    const name = document.getElementById("name").value;
    const rating = document.getElementById("rating").value;
    const review = document.getElementById("review").value;
    const file = document.getElementById("file").value;

    // Validate form data
    if (name && rating && review) {
        // Construct the message
        const message = `Review Details:\n\nName: ${name}\nRating: ${rating}\nReview: ${review}\nFile: ${file ? file : "Not provided"}`;

        // Show success message
        const successMessage = document.getElementById("successMessage");
        successMessage.style.display = "block";

        // Display form data in the success message
        successMessage.textContent = message;

        // Reset the form
        document.getElementById("review-form").reset();
    } else {
        alert("Please fill out all required fields.");
    }
});

Try copy and pasting to another js file
*/

