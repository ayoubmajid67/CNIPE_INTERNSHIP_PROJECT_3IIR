const toggleMenu = document.getElementById("toggleMenu");
const navBar = document.querySelector("header ul");
const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*().?/])[a-zA-Z0-9!@#$%^&*().?/]{6,}$/;
const emailPattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;

const baseUrls={
	local :"http://127.0.0.1:5000",
	host :"http://192.168.0.100:5000"
}
const baseUrl = baseUrls.host;
const headerUlDom = document.querySelector("header ul");

if (toggleMenu) {
	toggleMenu.onclick = function (event) {
		event.stopPropagation();
		navBar.classList.toggle("activeNav");
	};

	document.onclick = function (event) {
		if (!navBar.contains(event.target) && !toggleMenu.contains(event.target)) {
			navBar.classList.remove("activeNav");
		}
	};
}

const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
	loginBtn.onclick = function () {
		this.querySelector("a").click();
	};
}

let ul = document.querySelector("header ul");
function scrollToTopHard() {
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
}
function scrollToTopSmooth() {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
}

function goToHome() {
	if (location.pathname != "/index.html" && location.pathname != "/") location.href = "/";
}
function goToEspaceFormation() {
	if (location.pathname != "/EspaceFormation.html") location.href = "/EspaceFormation.html";
}
function isEspaceFormationPage() {
	return location.pathname == "/EspaceFormation.html";
}

function goToLoginPage() {
	if (location.pathname != "/login.html") location.href = "login.html";
}

let navBarImgs = document.querySelectorAll(".logoContainer img");
if (navBarImgs.length != 0) {
	let navBarImg1 = navBarImgs[0];
	let navBarImg2 = navBarImgs[1];
	navBarImg1.onclick = goToHome;
	navBarImg2.onclick = goToHome;
}

function getProfileImg() {
	return localStorage.getItem("profileImg");
}
function setProfileImg(value) {
	return localStorage.setItem("profileImg", value);
}

// confirm

async function managePusManageAdminsPageToDom() {
	try {
		const userRole = await getUserRole();

		if (userRole == "owner" && !isManageAdminsPage()) {
			// insert after aide li :
			const aideLi = headerUlDom.querySelector("li.aideLi");
			if (!headerUlDom.querySelector(".manageAdminsPage")) aideLi.insertAdjacentHTML("afterend", `<li class="manageAdminsPage"><a href="../manageAdmins.html">gestionAdmins</a></li>`);
		} else if (isManageAdminsPage()) {
			if (!userRole == "owner") goToHome();
		}
	} catch (error) {
		alertHint(error.message, error.type);
	}
}
function manageClearManageAdminsPageFromDom() {
	const manageAdminsLiDom = headerUlDom.querySelector(".manageAdminsPage");
	manageAdminsLiDom?.remove();
}

async function managePopManageAdminsPageToDom() {
	try {
		const userRole = await getUserRole();

		if (userRole == "owner") {
			// insert after aide li :
			const aideLi = headerUlDom.querySelector("li.aideLi");
			if (!headerUlDom.querySelector(".manageAdminsPage")) aideLi.insertAdjacentHTML("afterend", `<li class="manageAdminsPage"><a href="../manageAdmins.html">gestionAdmins</a></li>`);
		}
	} catch (error) {
		alertHint(error.message, error.type);
	}
}
function setUiLoginStat() {
	let LoginBtn = document.getElementById("loginBtn");
	if (loginBtn) {
		let profileImg = getProfileImg();

		loginBtn.innerText = "se déconnecter";
		loginBtn.id = "signOutBtn";
		let htmlStructure = `
	<li class="profile" >
	<div class="imgContainer ProfileImg">
	<img src="${profileImg}" alt="navbar icon" />
</div>
</li>

	`;

		ul.innerHTML += htmlStructure;
	}
}

function isCoursePage() {
	return location.pathname == "/course.html";
}

function isCourseContentPage() {
	return location.pathname == "/courseContent.html";
}
function isManageAdminsPage() {
	return location.pathname == "/manageAdmins.html";
}
function isProfilePage() {
	return location.pathname == "/course.html";
}
function goToHome() {
	if (location.pathname != "/index.html" && location.pathname != "/") location.href = "/";
}
function setUiGuestStat() {
	let signOutBtn = document.getElementById("signOutBtn");
	dropUserFromLocalSt();
	if (signOutBtn) {
		signOutBtn.innerHTML = `<a href="/login.html">Connexion</a>`;
		signOutBtn.id = "loginBtn";

		let profile = document.querySelector("ul li.profile");
		profile.remove();

		clearAdminCategoryBoxButtons();

		manageClearManageAdminsPageFromDom();

		if (isCoursePage() || isProfilePage() || isCourseContentPage() || isManageAdminsPage()) {
			goToHome();
		}
	}
}

function clearAdminCategoryBoxButtons() {
	const addDomainContentContainer = document.querySelector(".addDomainContainer");
	if (addDomainContentContainer) addDomainContentContainer.remove();

	const controlContainers = document.querySelectorAll(".controlContainer");

	controlContainers.forEach((controlContainer) => {
		controlContainer.remove();
	});
}

function dropUserFromLocalSt() {
	localStorage.removeItem("userToken");
	localStorage.removeItem("username");
	localStorage.removeItem("profileImg");
}

function goToProfilePage() {
	if (location.pathname != "/profile.html") {
		location.href = "profile.html";
	}
}

function isLogin() {
	return Boolean(localStorage.getItem("userToken") && localStorage.getItem("username"));
}

function getURLParameters() {
	var searchParams = new URLSearchParams(window.location.search);
	var params = {};

	for (let [key, value] of searchParams) {
		params[key] = value;
	}
	return params;
}

function changeURLWithoutLoad(newUrl) {
	window.history.replaceState({ path: newUrl }, "", newUrl);
}

function handelVisibilityPassword(passwordInput, togglePassword) {
	// Toggle the type attribute
	const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
	passwordInput.setAttribute("type", type);

	// Toggle the icon
	togglePassword.classList.toggle("fa-eye");
	togglePassword.classList.toggle("fa-eye-slash");
}

async function alertHint(msg, mode) {
	const section = document.querySelector("section.hint ");
	const divAlter = document.querySelector("section.hint > div");
	const alterTitle = document.querySelector("section.hint .alert-title");
	const alterContent = document.querySelector("section.hint .alert-content");

	divAlter.classList = `alert alert-${mode}`;
	alterTitle.innerHTML = mode;
	alterContent.innerText = msg;

	section.classList.add("ActiveAlter");

	await wait(100);
	divAlter.id = "ActiveAlter";

	await wait(4000);
	divAlter.id = "";
	section.classList.remove("ActiveAlter");
}
function wait(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

function getUsername() {
	let username = "";
	if ((user = localStorage.getItem("username"))) return user;
	else return "user";
}

function checkIfIsAValidPassword(password) {
	/*
	 the password must start with at least 5 letters, followed by at least one digit
	 , and can contain any characters after that.
*/
	return passwordPattern.test(password);
}

function checkRegex(password) {
	const numberPattern = /\d/;
	const specialCharacterPattern = /[^a-zA-Z0-9]/;
	const minLength = 6;
	const maxLength = 20;

	if (numberPattern.test(password)) {
		if (specialCharacterPattern.test(password)) {
			if (password.length >= minLength && password.length <= maxLength) {
				return 6;
			}
			return 5;
		}
		if (password.length >= minLength && password.length <= maxLength) {
			return 4;
		}
		return 3;
	}
	if (password.length >= minLength && password.length <= maxLength) {
		return 2;
	}
	if (specialCharacterPattern.test(password)) return 1;
	return 0;
}

function ChangeHint(value) {
	let Charhint = document.getElementById("charSize").style;
	let numBool = document.getElementById("numExi").style;
	let speCharBool = document.getElementById("charExi").style;
	switch (value) {
		case 6:
			Charhint.color = "green";
			numBool.color = "green";
			speCharBool.color = "green";
			break;
		case 5:
			Charhint.color = "red";
			numBool.color = "green";
			speCharBool.color = "green";
			break;
		case 4:
			Charhint.color = "green";
			numBool.color = "green";
			speCharBool.color = "red";
			break;
		case 3:
			Charhint.color = "red";
			numBool.color = "green";
			speCharBool.color = "red";
			break;
		case 2:
			Charhint.color = "green";
			numBool.color = "red";
			speCharBool.color = "red";
			break;
		case 1:
			Charhint.color = "red";
			numBool.color = "red";
			speCharBool.color = "green";
			break;
		default:
			Charhint.color = "red";
			numBool.color = "red";
			speCharBool.color = "red";
			break;
	}
}

function verifyDispBubbl(bool) {
	let hintBubble = document.getElementById("hintBubbl");
	if (bool) hintBubble.style.display = "flex";
	else hintBubble.style.display = "none";
}

function updateURLWithoutReload(url) {
	// Use pushState to update the URL without reloading the page
	history.pushState(null, null, url);
}

document.addEventListener("click", (event) => {
	if (event.target.id == "signOutBtn") {
		setUiGuestStat();
	}
	if (event.target == document.querySelector(".profile .ProfileImg img")) {
		goToProfilePage();
	}
});

let boxesContainer = document.querySelectorAll(".domainContent");
let searchInput = document.querySelector(".searchContainer input");

function filterCards(domain, attName) {
	domain.querySelectorAll(".domainContent .card").forEach((card) => {
		if (card.getAttribute(attName) && !card.getAttribute(attName).toLowerCase().trim().includes(searchInput.value.toLowerCase().trim())) {
			card.style.display = "none";
		} else {
			card.style.display = "flex";
		}
	});
}

function filterContainers(attName) {
	boxesContainer.forEach((domain) => {
		filterCards(domain, attName);
	});
}
let searchContainer = document.querySelector(".searchContainer .content");
function getDomainContentHtmlStructure(contentName) {
	return `			
	
	<div class="addDomainParent   ">
					<div class=" addDomainContainer">
						<button id="addDomainBtn" onclick="manageAddDomain(event)">Ajouter </button>
						<div class="addIconContainer">
          								<img src="imgs/createIcon.png" alt="create domain img" />
						</div>
					</div>
				</div>
	
	`;
}
function switchBtnHandler(btn, newClass, newText, newClickEventFunction) {
	if (btn) {
		btn.classList = newClass;
		btn.textContent = newText;
		if (newClickEventFunction) btn.setAttribute("onclick", newClickEventFunction);
	}
}

async function isAdminOrOwner() {
	try {
		if (!isLogin()) {
			setUiGuestStat();
			return false;
		}

		const token = localStorage.getItem("userToken");

		const response = await axios.get(`${baseUrl}/userRole`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const data = response.data;

		// Check the user's role
		return data.role !== "normal";
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.message) {
			throw { message: error.response.data.message, type: "warning" };
		} else {
			throw { message: "An unexpected error occurred.", type: "danger" };
		}
	}
}

async function getUserRole() {
	try {
		if (!isLogin()) {
			setUiGuestStat();
			return false;
		}

		// Make sure to include the token in the headers
		const token = localStorage.getItem("userToken");

		const response = await axios.get(`${baseUrl}/userRole`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		const data = response.data;

		// Check the user's role
		return data.role;
	} catch (error) {
		// Handle error and display message
		if (error.response && error.response.data && error.response.data.error) {
			throw { message: error.response.data.error, type: "warning" };
		} else {
			console.log(error);
			throw { message: "An unexpected error occurred.", type: "danger" };
		}
	}
}

function scrollToTopHard() {
	document.body.scrollTop = 0; // For Safari
	document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE, and Opera
}
function scrollToPositionHard(position) {
	document.body.scrollTop = position; // For Safari
	document.documentElement.scrollTop = position; // For Chrome, Firefox, IE, and Opera
}
function scrollToTopSmooth() {
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
}
function scrollToPositionSmooth(position) {
	window.scrollTo({
		top: position,
		behavior: "smooth",
	});
}
function autoResize(textarea) {
	textarea.style.height = "auto";
	textarea.style.height = textarea.scrollHeight + 20 + "px";
}
function throttle(func, limit) {
	let inThrottle;
	return function (...args) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

function asyncThrottle(func, limit) {
	let inThrottle = false;
	let pendingPromise = null;

	return async function (...args) {
		if (!inThrottle) {
			inThrottle = true;
			pendingPromise = func.apply(this, args);
			setTimeout(() => {
				inThrottle = false;
				pendingPromise = null;
			}, limit);
			return pendingPromise;
		} else if (pendingPromise) {
			// If we're within the throttle window, wait for the current promise to resolve
			return pendingPromise;
		}
	};
}
let globalIsAdminOrOwner = false;
let globalIsEnroll = false;
window.addEventListener("load", async function () {
	if (isLogin()) {
		setUiLoginStat();
		managePusManageAdminsPageToDom();
		try {
			globalIsAdminOrOwner = await isAdminOrOwner();
		} catch (error) {
			await altertHint(error.message, error.type);

			setUiGuestStat();
		}
	} else {
		setUiGuestStat();
	}
});
