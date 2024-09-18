const usernameDom = document.getElementById("username");
const emailDom = document.getElementById("email");
const userTypeDom = document.getElementById("userType");
const profileImgDom = document.getElementById("profilePic");
const fileInput = document.getElementById("file");
const saveBtn = document.getElementById("save");
const coursesListDom = [document.getElementById("course1"), document.getElementById("course2"), document.getElementById("course3")];
const userCoursesCurrentContentDom = [document.getElementById("course1CurrentContent"), document.getElementById("course2CurrentContent"), document.getElementById("course3CurrentContent")];
const activeAccountStatInput = document.getElementById("activeAccountStat");
const canCommentStatInput = document.getElementById("canCommentStat");
const passwordTitle = document.querySelector(".profilePasswordContainer h1");
const API_ENDPOINT = `${baseUrl}/profile`;
let changeToSave = false;
let newPassword = false;
const disableTogglePasswordClass = "unActive";

function setChangeToSave() {
	changeToSave = true;
	saveBtn.disabled = false;

	saveBtn.classList.add("unable");
}
function unsetChangeToSave() {
	changeToSave = false;
	saveBtn.disabled = true;
	saveBtn.classList.remove("unable");
}

// Function to handle the "Save" button click event

async function getSaveProfileResponse(formData) {
	let token = localStorage.getItem("userToken");
	const config = {
		headers: {
			"Content-Type": "multipart/form-data",
			Authorization: `Bearer ${token}`,
		},
	};

	const response = await axios.put(`${baseUrl}/profile`, formData, config);
	return response.data;
}
function updateProfileImgDom(newProfileImg) {
	let profileImg = document.querySelector(".ProfileImg img");
	profileImg.src = newProfileImg;
	setProfileImg(newProfileImg);
}
saveBtn.addEventListener("click", async (event) => {
	if (!changeToSave) unsetChangeToSave();

	try {
		let profileImgFile = fileInput.files[0];
		let formData = new FormData();
		if (newPassword) formData.append("password", newPassword);

		if (profileImgFile) formData.append("profileImg", profileImgFile);

		const data = await getSaveProfileResponse(formData);

		if (profileImgFile) {
			setProfileImg(data.profileImg);
			updateProfileImgDom(data.profileImg);
		}
		unsetChangeToSave();
		unsetPasswordMode();
		scrollToTopSmooth();

		alertHint(data.message, "success");
	} catch (error) {
		if (error.response && error.response.data && error.response.data.error) {
			console.log(error.response.data.error);
			alertHint(error.response.data.message, "warning");
		} else {
			console.error(error);
			alertHint(" Une erreur inattendue s'est produite", "danger");
		}
	}
});
const allowedExtensions = new Set(["png", "jpg", "jpeg", "gif", "webp"]);
fileInput.addEventListener("change", handleFileChange);

async function handleFileChange() {
	setChangeToSave();

	this.disabled = true;
	const file = this.files[0];
	if (file) {
		const fileExtension = file.name.split(".").pop().toLowerCase();
		if (allowedExtensions.has(fileExtension)) {
			setChangeToSave();
			const reader = new FileReader();
			reader.onload = () => {
				profileImgDom.src = reader.result;
			};
			reader.readAsDataURL(file);
		} else {
			await alertHint("Type de fichier invalide. Veuillez sélectionner un fichier PNG, JPG, JPEG ou GIF.", "wearing");
			this.value = "";
		}
	}

	this.disabled = false;
}

function fillProfile(user) {
	profileImgDom.src = user.profileImg;

	usernameDom.value = user.username;
	emailDom.value = user.email;
	userTypeDom.value = user.accountType;
	activeAccountStatInput.value = user.status == "active" ? "Enabled ✅" : "Disabled ❌";
	canCommentStatInput.value = user.canComment ? "Enabled ✅" : "Disabled ❌";

	user.enrolledCourses?.forEach((course, index) => {
		coursesListDom[index].value = `[${course.courseName.toUpperCase()}] from [${course.categoryName.toUpperCase()}]`;
		coursesListDom[index].classList.add("activeCourse");
		coursesListDom[index].addEventListener("click", () => {
			window.location = `course.html?categoryName=${course.categoryName}&courseName=${course.courseName}`;
		});
		userCoursesCurrentContentDom[index].textContent = `contenu vidéo actuel: ${course.currentContent}`;

		if (index == 2) return;
	});
}
async function fetchData() {
	try {
		const token = localStorage.getItem("userToken");
		const headers = {
			Authorization: `Bearer ${token}`,
		};

		const response = await fetch(API_ENDPOINT, { headers });
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const data = await response.json();

		fillProfile(data.user);
	} catch (error) {
		if (error.response && error.response.data && error.response.data.error) {
			console.log(error.response.data.error);
			alertHint(error.response.data.message, "warning");
		} else {
			console.error(error);
			alertHint(" Une erreur inattendue s'est produite", "danger");
		}
	}
}

profileImgDom.addEventListener("auxclick", (e) => {
	e.preventDefault();
});

window.addEventListener("beforeunload", () => {
	fileInput.value = "";
});
function setFocusEnd(inputElem) {
	if (inputElem.setSelectionRange) {
		inputElem.focus();
		// Get the current text length
		const textLength = inputElem.value.length;
		// Set the cursor position at the end of the text
		inputElem.setSelectionRange(textLength, textLength);
	}
}
function changeVisibility(event) {
	event.preventDefault();

	let targetInput = event.target.previousElementSibling;
	handelVisibilityPassword(targetInput, event.target);
	setFocusEnd(targetInput);
}

const NewPasswordIcon = document.getElementById("toggleNewPassword");
const confirmedPasswordIcon = document.getElementById("toggleConfirmPassword");
const NewPasswordInput = document.getElementById("newPassword");
const confirmedPasswordInput = document.getElementById("confirmPassword");

function setONConfirmNewPassword() {
	NewPasswordIcon.classList.remove(disableTogglePasswordClass);
	confirmedPasswordIcon.classList.remove(disableTogglePasswordClass);
}
function setOffConfirmNewPassword() {
	NewPasswordIcon.classList.add(disableTogglePasswordClass);
	confirmedPasswordIcon.classList.add(disableTogglePasswordClass);
	NewPasswordInput.disabled = true;
	confirmedPasswordInput.disabled = true;
	NewPasswordInput.value = "";
	confirmedPasswordInput.value = "";
}

function disableConfirmToggleInput() {
	confirmedPasswordIcon.classList.add(disableTogglePasswordClass);
	confirmedPasswordInput.disabled = true;
	confirmedPasswordInput.value = "";
}
function disableNewToggleInput() {
	NewPasswordIcon.classList.add(disableTogglePasswordClass);
	NewPasswordInput.disabled = true;
	NewPasswordInput.value = "";
}

function changeVisibility(event) {
	event.preventDefault();

	let targetInput = event.target.previousElementSibling;
	handelVisibilityPassword(targetInput, event.target);
	setFocusEnd(targetInput);
}

function setPasswordMode() {
	passwordTitle.innerHTML += `<span> Pour sauvegarder </span>`;
	NewPasswordInput.classList.add("saveMode");
}
function unsetPasswordMode() {
	passwordTitle.innerHTML = `mot de passe`;
	NewPasswordInput.classList.remove("saveMode");
	newPassword = false;
}
function unableNewToggleInput() {
	NewPasswordIcon.classList.remove(disableTogglePasswordClass);
	NewPasswordInput.disabled = false;
	NewPasswordInput.focus();
}
function unableConfirmToggleInput() {
	confirmedPasswordIcon.classList.remove(disableTogglePasswordClass);
	confirmedPasswordInput.disabled = false;
	confirmedPasswordInput.focus();
}
NewPasswordInput.addEventListener("input", function () {
	if (changeToSave) return;

	ChangeHint(checkRegex(this.value));
	const isValidPassword = checkIfIsAValidPassword(this.value);

	verifyDispBubbl(!isValidPassword);
	if (isValidPassword) {
		unableConfirmToggleInput();
	} else {
		disableConfirmToggleInput();
	}
});
confirmedPasswordInput.addEventListener("input", function () {
	if (changeToSave) return;
	if (this.value.trim() == NewPasswordInput.value.trim()) {
		newPassword = this.value.trim();
		setChangeToSave();
		setPasswordMode();
		disableConfirmToggleInput();
	}
});
confirmedPasswordInput.addEventListener("focusin", function () {
	if (newPassword) disableConfirmToggleInput();
});

NewPasswordInput.addEventListener("focusin", function () {
	if (!checkIfIsAValidPassword(this.value.trim())) verifyDispBubbl(true);
});

NewPasswordInput.addEventListener("focusout", function () {
	verifyDispBubbl(false);
});

// Call the function to fetch data

function generateResume() {
	// Get values from profile fields
	const username = document.getElementById("username").value;
	const email = document.getElementById("email").value;
	const userType = document.getElementById("userType").value;
	const accountStatus = document.getElementById("activeAccountStat").value;
	const commentStatus = document.getElementById("canCommentStat").value;

	const profileImageUrl = document.querySelector(".ProfileImg img").src;

	const course1 = document.getElementById("course1").value;
	const course1Content = document.getElementById("course1CurrentContent").textContent;
	const course2 = document.getElementById("course2").value;
	const course2Content = document.getElementById("course2CurrentContent").textContent;
	const course3 = document.getElementById("course3").value;
	const course3Content = document.getElementById("course3CurrentContent").textContent;

	document.getElementById("resumeUsername").textContent = username;
	document.getElementById("resumeEmail").textContent = email;
	document.getElementById("resumeUserType").textContent = userType;
	document.getElementById("resumeAccountStatus").textContent = accountStatus;
	document.getElementById("resumeCommentStatus").textContent = commentStatus;

	document.getElementById("resumeProfileImage").src = profileImageUrl;

	document.getElementById("resumeCourse1").textContent = course1;
	document.getElementById("resumeCourseContent1").textContent = course1Content;
	document.getElementById("resumeCourse2").textContent = course2;
	document.getElementById("resumeCourseContent2").textContent = course2Content;
	document.getElementById("resumeCourse3").textContent = course3;
	document.getElementById("resumeCourseContent3").textContent = course3Content;

	const resumeContainer = document.getElementById("resumeContainer");
	setCurrentDateTime();
	resumeContainer.style.display = "block";

	window.print();

	resumeContainer.style.display = "none";
}

function setCurrentDateTime() {
	const now = new Date();

	const date = now.toLocaleDateString();
	const time = now.toLocaleTimeString();

	// Inject the date and time into the HTML
	document.getElementById("printDate").textContent = date;
	document.getElementById("printTime").textContent = time;
}

window.addEventListener("load", () => {
	fetchData();

	document.querySelector(".renewBtn").addEventListener("click", generateResume);
});
