export default class clsManageSideBarAndOptions {
	static optionsContainerDom = document.getElementById("contentOptions");
	static optionsListDom = clsManageSideBarAndOptions.optionsContainerDom.querySelectorAll("li a");
	static courseInfoContainerDom = document.querySelector(".courseInfoContainer");
	static sectionsListDom = clsManageSideBarAndOptions.courseInfoContainerDom.querySelectorAll(".courseInfoContainer .courseSection ");
	static #currentSectionClass = "currentSection";
	static #currentOptionClass = "currentOption";
	static #closeRightSideClass = "closeRightSide";
	static rightSideContainerDom = document.querySelector(".mainContent > .content > .rightSide");
	static openPanelDom = clsManageSideBarAndOptions.rightSideContainerDom.querySelector("#openPanel");
	static closePanelDom = clsManageSideBarAndOptions.rightSideContainerDom.querySelector("#closePanel");
	static fillModeIconDom = document.querySelector(".leftSide .fillVideoContainer");
	static fillModeClass = "fillMode";

	static predictedCurrentBoxClass = "predictedCurrentBox";
	constructor() {}

	addFillVideoEvent() {
		clsManageSideBarAndOptions.fillModeIconDom.addEventListener("click", () => {
			document.getElementById("currentVideo").classList.toggle(clsManageSideBarAndOptions.fillModeClass);
		});
	}

	init() {
		this.addFillVideoEvent();
		this.manageRightContentResponsive();
		this.loadSectionFromURL();
		this.manageOptionClick();

		this.manageCloseOpenRightSideBar();

		window.addEventListener("resize", () => {
			this.manageRightContentResponsive();
		});

		this.loadCurrentContent();
	}
	manageCloseOpenRightSideBar() {
		clsManageSideBarAndOptions.openPanelDom.addEventListener("click", () => {
			clsManageSideBarAndOptions.rightSideContainerDom.classList.remove(clsManageSideBarAndOptions.#closeRightSideClass);
		});
		clsManageSideBarAndOptions.closePanelDom.addEventListener("click", () => {
			clsManageSideBarAndOptions.rightSideContainerDom.classList.add(clsManageSideBarAndOptions.#closeRightSideClass);
		});
	}

	allowSectionToShow(targetSection) {
		clsManageSideBarAndOptions.sectionsListDom.forEach((section) => {
			if (section.classList.contains(clsManageSideBarAndOptions.#currentSectionClass)) {
				section.classList.remove(clsManageSideBarAndOptions.#currentSectionClass);
			}
		});

		targetSection.classList.add(clsManageSideBarAndOptions.#currentSectionClass);
	}

	#handelOptionClick(targetOption) {
		let existStatus = false;
		clsManageSideBarAndOptions.optionsListDom.forEach((option) => {
			if (option.parentElement.classList.contains(clsManageSideBarAndOptions.#currentOptionClass)) {
				if (option == targetOption) {
					existStatus = true;
					return;
				}
				option.parentElement.classList.remove(clsManageSideBarAndOptions.#currentOptionClass);
			}
		});
		if (existStatus) return;

		const parentLiDom = targetOption.parentElement;
		parentLiDom.classList.add(clsManageSideBarAndOptions.#currentOptionClass);

		const targetSection = Array.from(clsManageSideBarAndOptions.sectionsListDom).find((section) => section.classList.contains(`${targetOption.dataset.section}`));
		this.allowSectionToShow(targetSection);
	}
	addRightSideBarOption() {
		let ulDom = clsManageSideBarAndOptions.optionsContainerDom.querySelector("ul");
		// Check if the list item does not already exist
		let contentOption = "";
		if (!ulDom.querySelector("li a[data-section='contentSection']")) {
			ulDom.insertAdjacentHTML("afterbegin", `<li><a href="#contentSection" data-section="contentSection">Content</a></li>`);
			contentOption = ulDom.querySelector("li a[data-section='contentSection']");
			contentOption.addEventListener("click", (event) => {
				this.#handelOptionClick(contentOption);
			});
			clsManageSideBarAndOptions.optionsListDom = clsManageSideBarAndOptions.optionsContainerDom.querySelectorAll("li a");
		}
		return contentOption;
	}
	removeRightSideBarOption() {
		let ulDom = clsManageSideBarAndOptions.optionsContainerDom.querySelector("ul");
		// Check if the list item does not already exist
		let contentOptionDom;
		if ((contentOptionDom = ulDom.querySelector("li a[data-section='contentSection']"))) {
			if (contentOptionDom.parentElement.classList.contains(clsManageSideBarAndOptions.#currentOptionClass)) {
				console.log(contentOptionDom.parentElement);
				const overviewOptionDom = ulDom.querySelector("li a[data-section='overviewSection']");
				overviewOptionDom.click();
			}

			contentOptionDom.parentElement.remove();

			clsManageSideBarAndOptions.optionsListDom = clsManageSideBarAndOptions.optionsContainerDom.querySelectorAll("li a");
		}
		return contentOptionDom;
	}

	addRightSideContentToSection() {
		if (!clsManageSideBarAndOptions.courseInfoContainerDom.querySelector(".contentSection")) {
			let content = `<div class="container contentSection courseSection">`;
			content += clsManageSideBarAndOptions.rightSideContainerDom.outerHTML;

			content += "</div>";
			clsManageSideBarAndOptions.courseInfoContainerDom.insertAdjacentHTML("afterbegin", content);
			clsManageSideBarAndOptions.sectionsListDom = clsManageSideBarAndOptions.courseInfoContainerDom.querySelectorAll(".courseInfoContainer .courseSection ");
		}
	}

	removeRightSideContentSection() {
		let contentSectionDom;
		if ((contentSectionDom = clsManageSideBarAndOptions.courseInfoContainerDom.querySelector(".contentSection"))) {
			clsManageSideBarAndOptions.rightSideContainerDom.querySelector(".videosLectureContainer").innerHTML = contentSectionDom.querySelector(".videosLectureContainer").innerHTML;

			contentSectionDom.remove();

			clsManageSideBarAndOptions.sectionsListDom = clsManageSideBarAndOptions.courseInfoContainerDom.querySelectorAll(".courseInfoContainer .courseSection ");
		}
	}

	manageRightContentResponsive() {
		if (window.innerWidth < 1400) {
			const contentOption = this.addRightSideBarOption();
			this.addRightSideContentToSection();

			// if (contentOption) contentOption.click();
		} else {
			this.removeRightSideBarOption();
			this.removeRightSideContentSection();
		}
	}

	manageOptionClick() {
		clsManageSideBarAndOptions.optionsListDom.forEach((option) => {
			option.addEventListener("click", (event) => {
				this.#handelOptionClick(option);
			});
		});
	}

	loadSectionFromURL() {
		const hash = window.location.hash;
		let targetOption;

		if (hash) {
			targetOption = Array.from(clsManageSideBarAndOptions.optionsListDom).find((option) => option.getAttribute("href") === hash);
		}

		if (!targetOption) {
			targetOption = Array.from(clsManageSideBarAndOptions.optionsListDom).find((option) => option.dataset.section === "overviewSection");
		}

		if (targetOption) {
			this.#handelOptionClick(targetOption);
		}
	}

	loadCurrentContent() {
		let contentBoxesContainer = document.querySelector(".videosLectureContainer");
		if (contentBoxesContainer.children.length == 0) {
			const leftSide = document.querySelector(".mainContent > .content > .leftSide");
			leftSide.style.visibility = "hidden";
			return;
		}
		let currentPredictedContentBox = document.querySelector(` .videosLectureContainer .${clsManageSideBarAndOptions.predictedCurrentBoxClass}`);

		currentPredictedContentBox.classList.remove(clsManageSideBarAndOptions.predictedCurrentBoxClass);

		currentPredictedContentBox.click();
	}
}
