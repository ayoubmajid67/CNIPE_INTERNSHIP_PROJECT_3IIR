class clsLocalStorage {
	static setUser(token, username) {
		localStorage.setItem("userToken", token);
		localStorage.setItem("username", username);
	}

	static getToken() {
		return localStorage.getItem("userToken");
	}

	static dropUserFromLocalStorage() {
		localStorage.removeItem("userToken");
		localStorage.removeItem("userInfo");
	}
}
class clsTable {
	static toggleUserBtnContent = ["Show All Admins", "Hide All Admins"];

	constructor() {
		this.userTable = document.querySelector(".userTable");
		this.tableContainerContentDom = document.getElementById("userTableBody");
		this.toggleUsersShowBtnDom = document.getElementById("toggleShowUsersBtn");
		this.userFilter = document.getElementById("username");
		this.userColumnsPrevValues = {
			username: "",
			email: "",
			password: "",
			role: "",
			status: "",
			canComment: "",
		};
		this.userChangeInputsInfo = {
			username: false,
			email: false,
			password: false,
			role: false,
			status: false,
			canComment: false,
		};

		this.toggleUsersShowBtnDom.addEventListener("click", () => {
			this.#toggleUserShow();
		});

		this.manageGetUsers();
		this.handelTableResponsive();
	}

	handelTableResponsive() {
		if (window.innerHeight >= 1600) {
			this.userTable.removeAttribute("style");
			return;
		}

		this.userTable.removeAttribute("style");

		const WidthRole = {
			basicWindowWidth: 1000,
			basicFontSize: 16,
		};
		const newFontSize = Math.floor((WidthRole.basicFontSize * window.innerWidth) / WidthRole.basicWindowWidth);
		this.userTable.style.fontSize = `${newFontSize}px`;
	}

	#toggleUserShow() {
		const isHidden = Number(this.tableContainerContentDom.classList.contains("hidden"));
		this.toggleUsersShowBtnDom.textContent = clsTable.toggleUserBtnContent[isHidden];
		this.tableContainerContentDom.classList.toggle("hidden");
	}

	async #getUsersApi() {
		let accessToken = clsLocalStorage.getToken();

		try {
			const response = await axios.get(`${baseUrl}/admins`, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const data = response.data;

			return data;
		} catch (error) {
			if (error.response && error.response.data && error.response.data.error) {
				let message = error.response.data.error;

				throw { message, type: "warning" };
			} else {
				throw { message: "An unexpected error occurred.", type: "danger" };
			}
		}
	}

	static getUserHtmlStructure(user) {
		return `
            <tr class='userCard' username=${user.username}>
                <td class="username">${user.username}</td>
                <td class="email">${user.email}</td>
                <td class="password" ></td>
                <td class="role">${user.accountType}</td>
                <td class="status">${user.status}</td>
                <td class="canComment">${user.canComment}</td>
                <td class="btnColumn editColumn">
                    <div class="btnContainer">
                        <button onclick='tableObject.editUserCard(event)' class="edit">Modifier</button>
                    </div>
                </td>
                <td class="btnColumn saveColumn">
                    <div class="btnContainer">
                        <button disabled onclick='tableObject.saveUserCard(event)'>Enregistrer</button>
                    </div>
                </td>
            </tr>
        `;
	}

	async manageGetUsers() {
		try {
			const users = await this.#getUsersApi();
			this.tableContainerContentDom.innerHTML = "";

			users.forEach((user) => {
				const userHtmlStructure = clsTable.getUserHtmlStructure(user);
				this.tableContainerContentDom.insertAdjacentHTML("beforeend", userHtmlStructure);
			});
		} catch (error) {
			await alertHint(error.message, error.type);
		}
	}

	#convertEditedCardColumnsToEditMode(userColumns) {
		userColumns.emailDom.innerHTML = `<input type="email" class="targetEmail" value='${this.userColumnsPrevValues.email}' />`;
		userColumns.passwordDom.innerHTML = `<input type="text" class="targetPassword" value='${this.userColumnsPrevValues.password}' />`;

		// Role field with select options
		userColumns.roleDom.innerHTML = `
            <select class="targetRole">
                <option value="admin" ${this.userColumnsPrevValues.role === "admin" ? "selected" : ""}>Admin</option>
                <option value="normal" ${this.userColumnsPrevValues.role === "normal" ? "selected" : ""}>Normal</option>
            </select>
        `;

		// Status field with select options
		userColumns.statusDom.innerHTML = `
            <select class="targetStatus">
                <option value="active" ${this.userColumnsPrevValues.status === "active" ? "selected" : ""}>Active</option>
                <option value="inactive" ${this.userColumnsPrevValues.status === "inactive" ? "selected" : ""}>Inactive</option>
            </select>
        `;

		userColumns.canCommentDom.innerHTML = `
            <select class="targetCanComment">
                <option value="true" ${this.userColumnsPrevValues.canComment === "true" ? "selected" : ""}>True</option>
                <option value="false" ${this.userColumnsPrevValues.canComment === "false" ? "selected" : ""}>False</option>
            </select>
        `;

		userColumns.emailDom.querySelector("input").focus();
	}

	#setUserPreviousValues(userColumns) {
		this.userColumnsPrevValues.email = userColumns.emailDom.textContent;
		this.userColumnsPrevValues.password = userColumns.passwordDom.textContent;
		this.userColumnsPrevValues.role = userColumns.roleDom.textContent;
		this.userColumnsPrevValues.status = userColumns.statusDom.textContent;
		this.userColumnsPrevValues.canComment = userColumns.canCommentDom.textContent;
	}

	#checkIsAllowToActivateSaveBtn(saveBtn) {
		if (this.userChangeInputsInfo.email || this.userChangeInputsInfo.password || this.userChangeInputsInfo.role || this.userChangeInputsInfo.status || this.userChangeInputsInfo.canComment) {
			saveBtn.disabled = false;
			return true;
		} else {
			saveBtn.disabled = true;
			return false;
		}
	}

	#editUserInputTrack(input, userOptionName) {
		const value = input.value.trim();
		if (value && value != this.userColumnsPrevValues[userOptionName]) this.userChangeInputsInfo[userOptionName] = true;
		else this.userChangeInputsInfo[userOptionName] = false;
	}

	#addEventChangeValueTrackerToUserInputs(userColumns, saveBtn) {
		userColumns.emailDom.addEventListener("input", (event) => {
			this.#editUserInputTrack(event.target, "email");
			this.#checkIsAllowToActivateSaveBtn(saveBtn);
		});
		userColumns.passwordDom.addEventListener("input", (event) => {
			this.#editUserInputTrack(event.target, "password");
			this.#checkIsAllowToActivateSaveBtn(saveBtn);
		});
		userColumns.roleDom.addEventListener("input", (event) => {
			this.#editUserInputTrack(event.target, "role");
			this.#checkIsAllowToActivateSaveBtn(saveBtn);
		});
		userColumns.statusDom.addEventListener("input", (event) => {
			this.#editUserInputTrack(event.target, "status");
			this.#checkIsAllowToActivateSaveBtn(saveBtn);
		});
		userColumns.canCommentDom.addEventListener("input", (event) => {
			this.#editUserInputTrack(event.target, "canComment");
			this.#checkIsAllowToActivateSaveBtn(saveBtn);
		});
	}

	#cancelEditPrevUserCards() {
		const editStatCards = this.tableContainerContentDom.querySelectorAll(".editStat");
		editStatCards.forEach((userCard) => {
			const cancelBtn = userCard.querySelector("button.cancel");
			cancelBtn.click();
		});
	}

	editUserCard(event) {
		this.#cancelEditPrevUserCards();

		const editBtn = event.target;

		switchBtnHandler(editBtn, "cancel", "Annuler", "tableObject.cancelEditUserCard(event)");
		const targetUserCard = editBtn.closest(".userCard");
		targetUserCard.classList.add("editStat");
		const saveBtn = targetUserCard.querySelector(".saveColumn button");
		let userColumns = {
			emailDom: targetUserCard.querySelector(".email"),
			passwordDom: targetUserCard.querySelector(".password"),
			roleDom: targetUserCard.querySelector(".role"),
			statusDom: targetUserCard.querySelector(".status"),
			canCommentDom: targetUserCard.querySelector(".canComment"),
		};
		this.#addEventChangeValueTrackerToUserInputs(userColumns, saveBtn);
		this.#setUserPreviousValues(userColumns);
		this.#convertEditedCardColumnsToEditMode(userColumns);
	}

	#convertEditedCardColumnsToNormalMode(userColumns) {
		userColumns.emailDom.innerHTML = this.userColumnsPrevValues.email;
		userColumns.passwordDom.innerHTML = this.userColumnsPrevValues.password;
		userColumns.roleDom.innerHTML = this.userColumnsPrevValues.role;
		userColumns.statusDom.innerHTML = this.userColumnsPrevValues.status;
		userColumns.canCommentDom.innerHTML = this.userColumnsPrevValues.canComment;
	}

	async #saveUpdateAdminApi(updatedUserData, username) {
		let accessToken = clsLocalStorage.getToken();

		try {
			const response = await axios.put(`${baseUrl}/admins/${username}`, updatedUserData, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			});
		} catch (error) {
			if (error.response && error.response.data && error.response.data.error) {
				let message = error.response.data.error;

				throw { message, type: "warning" };
			} else {
				console.log(error);
				throw { message: "An unexpected error occurred.", type: "danger" };
			}
		}
	}

	async saveUserCard(event) {
		const saveBtn = event.target;
		const targetUserCard = saveBtn.closest(".userCard");
		const username = targetUserCard.getAttribute("username");

		const userColumns = {
			emailDom: targetUserCard.querySelector(".email"),
			passwordDom: targetUserCard.querySelector(".password"),
			roleDom: targetUserCard.querySelector(".role"),
			statusDom: targetUserCard.querySelector(".status"),
			canCommentDom: targetUserCard.querySelector(".canComment"),
		};

		const updatedUserData = {
			email: userColumns.emailDom.querySelector("input").value.trim(),
			password: userColumns.passwordDom.querySelector("input").value.trim(),
			accountType: userColumns.roleDom.querySelector("select").value.trim(),
			status: userColumns.statusDom.querySelector("select").value.trim(),
			canComment: userColumns.canCommentDom.querySelector("select").value.trim() == "true",
		};

		let accessToken = clsLocalStorage.getToken();

		try {
			await this.#saveUpdateAdminApi(updatedUserData, username);
			this.#convertEditedCardColumnsToNormalMode(userColumns);
			targetUserCard.classList.remove("editStat");

			this.#cancelEditPrevUserCards();
			this.manageGetUsers();
			await alertHint("L'utilisateur a été mis à jour avec succès.", "success");
		} catch (error) {
			alertHint(error.message, error.type);
		}
	}

	cancelEditUserCard(event) {
		const cancelBtn = event.target;
		switchBtnHandler(cancelBtn, "edit", "Modifier", "tableObject.editUserCard(event)");
		const targetUserCard = cancelBtn.closest(".userCard");
		const userColumns = {
			emailDom: targetUserCard.querySelector(".email"),
			passwordDom: targetUserCard.querySelector(".password"),
			roleDom: targetUserCard.querySelector(".role"),
			statusDom: targetUserCard.querySelector(".status"),
			canCommentDom: targetUserCard.querySelector(".canComment"),
		};

		this.#convertEditedCardColumnsToNormalMode(userColumns);
		targetUserCard.classList.remove("editStat");
		this.#cancelEditPrevUserCards();
	}
}

class filter {
	constructor(usersContainer) {
		this.filterInputDom = document.getElementById("username"); // Username input for filtering
		this.searchBtnDom = document.getElementById("searchBtn");
		this.usersContainerDom = usersContainer;

		// Reset filter when input is cleared
		this.filterInputDom.addEventListener("input", () => {
			if (this.filterInputDom.value === "") {
				this.#showAllUsersBox();
			}
		});

		// Press Enter to search
		this.filterInputDom.addEventListener("keypress", (event) => {
			if (event.key === "Enter") this.searchBtnDom.click();
		});

		// Click on search button
		this.searchBtnDom.addEventListener("click", () => {
			this.searchBtnDom.disabled = true;
			this.#filterUsersContainer();
			this.searchBtnDom.disabled = false;
		});
	}

	#showAllUsersBox() {
		this.usersContainerDom.querySelectorAll(".userCard").forEach((userBox) => {
			userBox.style.display = "table-row"; // Show all user cards
		});
	}

	#filterUsersContainer() {
		let username = this.filterInputDom.value.trim();
		if (username) {
			this.usersContainerDom.querySelectorAll(".userCard").forEach((userBox) => {
				// Filter users based on the username attribute in the user cards
				if (userBox.getAttribute("username") === username) {
					userBox.style.display = "table-row";
				} else {
					userBox.style.display = "none";
				}
			});
		}
	}
}

class clsAddUserForm {
	#userValues = {
		username: "",
		email: "",
		password: "",
		accountType: "admin",
		status: "active",
		canComment: "true",
	};

	constructor(usersContainer) {
		this.addUserFormDom = document.getElementById("addAdminForm");
		this.usernameInputDom = document.getElementById("newUsername");
		this.emailInputDom = document.getElementById("newEmail");
		this.passwordInputDom = document.getElementById("newPassword");
		this.confirmPasswordInputDom = document.getElementById("newConfirmPassword");

		this.submitBtnDom = document.getElementById("submitAddAdminBtn");
		this.usersContainerDom = usersContainer;
		this.togglePassword = document.getElementById("togglePassword");

		this.toggleConformPassword = document.getElementById("toggleConfirm");

		this.addToggleEvent();

		this.addUserFormDom.addEventListener("submit", async (event) => {
			event.preventDefault();
			this.submitBtnDom.disabled = true;

			if (this.#ValidateInputs() && this.#validatePasswords()) {
				await this.manageAddNewUser();
			} else {
				this.submitBtnDom.disabled = true;
				alertHint("Passwords do not match.", "warning");
			}
		});
	}
	addInputValidateEvent() {
		this.usernameInputDom.addEventListener("input", () => {
			if (this.#ValidateInputs()) this.submitBtnDom.disabled = false;
			else this.submitBtnDom.disabled = true;
		});
		this.emailInputDom.addEventListener("input", () => {
			if (this.#ValidateInputs()) this.submitBtnDom.disabled = false;
			else this.submitBtnDom.disabled = true;
		});
		this.passwordInputDom.addEventListener("input", () => {
			const passwordValue = this.passwordInputDom.value;
			ChangeHint(checkRegex(passwordValue));
			const isValidPassword = checkIfIsAValidPassword(passwordValue);

			verifyDispBubbl(!isValidPassword);
			if (this.#ValidateInputs()) this.submitBtnDom.disabled = false;
			else this.submitBtnDom.disabled = true;
		});
		this.passwordInputDom.addEventListener("focusout", function () {
			verifyDispBubbl(false);
		});

		this.confirmPasswordInputDom.addEventListener("input", () => {
			if (this.#ValidateInputs()) this.submitBtnDom.disabled = false;
			else this.submitBtnDom.disabled = true;
		});
	}

	addToggleEvent() {
		this.togglePassword.addEventListener("click", () => {
			handelVisibilityPassword(this.passwordInputDom, this.togglePassword);
		});
		this.toggleConformPassword.addEventListener("click", () => {
			handelVisibilityPassword(this.confirmPasswordInputDom, this.toggleConformPassword);
		});

		this.addInputValidateEvent();
	}
	#validatePasswords() {
		// Check if password and confirm password match
		const password = this.passwordInputDom.value;
		const confirmPassword = this.confirmPasswordInputDom.value;
		console.log(password === confirmPassword && checkIfIsAValidPassword(password));
		return password === confirmPassword && checkIfIsAValidPassword(password);
	}
	#ValidateInputs() {
		return this.usernameInputDom.value && this.emailInputDom.value && this.#validatePasswords();
	}

	#fillAddUserFormValues() {
		this.#userValues.username = this.usernameInputDom.value;
		this.#userValues.email = this.emailInputDom.value;
		this.#userValues.password = this.passwordInputDom.value;
	}

	async #addNewUserApi() {
		let accessToken = clsLocalStorage.getToken();

		try {
			const response = await axios.post(
				`${baseUrl}/admins`, // Assuming this is the endpoint for admin creation
				this.#userValues,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			);

			const data = response.data;
			return data;
		} catch (error) {
			// Handle error and display message
			if (error.response && error.response.data && (error.response.data.message || error.response.data.detail || error.response.data.error)) {
				let message = error.response.data.detail ? error.response.data.detail : error.response.data.message ? error.response.data.message : error.response.data.error;
				throw { message, type: "warning" };
			} else {
				throw { message: "An unexpected error occurred.", type: "danger" };
			}
		}
	}

	async manageAddNewUser() {
		this.#fillAddUserFormValues();

		try {
			let data = await this.#addNewUserApi();
			let user = data.user;
			const userHtmlStructure = clsTable.getUserHtmlStructure(user);
			this.usersContainerDom.insertAdjacentHTML("beforeend", userHtmlStructure);

			this.#clearAddUserInputs();
			alertHint(data.message, "success");
		} catch (error) {
			alertHint(error.message, error.type);
			this.submitBtnDom.disabled = false;
		}
	}

	#clearAddUserInputs() {
		this.usernameInputDom.value = "";
		this.emailInputDom.value = "";
		this.passwordInputDom.value = "";
		this.confirmPasswordInputDom.value = "";
	}
}

// main : --------------------------------------

let tableObject = "";
window.addEventListener("load", () => {
	tableObject = new clsTable();
	const filterObject = new filter(tableObject.tableContainerContentDom);
	const addUserObject = new clsAddUserForm(tableObject.tableContainerContentDom);
});

window.addEventListener("resize", () => {
	tableObject.handelTableResponsive();
});
