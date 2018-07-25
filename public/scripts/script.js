(function() {

document.addEventListener('DOMContentLoaded', () => {

    registerFormSubmission();
    navigationFormsModalActivation();
    curriculumFormConfiguration();
    getAndShowCurriculaFromSearchBox();
    requestToSaveCurriculumInDB();
    requestToDeleteCurriculumInDB();

});

let registerFormSubmission = () => {
    if (document.getElementById('register-form')) {

        const registerFormInputs = document.getElementById('register-form').querySelectorAll('input');
        const submitBtn = document.getElementById('submit-register-form-btn');

        let regexps = {
            username: /^[a-zA-Z\d]{4,20}$/,
            email: /^([a-zA-Z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,})(\.[a-z]{2,})?$/,
            password: /^.{4,}$/
        }

        registerFormInputs.forEach((input) => {
            input.addEventListener('keyup', (e) => {
                // validate the username, email and password inputs
                validate(e.target, regexps[e.target.attributes.name.value]);
            });
        });

        function validate(elem, regex) {
            if (elem.attributes.name.value == 'username' && elem.value !== '')
                handleInvalidUser(elem)

            if (regex.test(elem.value)) {
                elem.className = 'valid-input';
            } else {
                elem.className = 'invalid-input';
            }
        }

        function handleInvalidUser(elem) {

            fetch('http://abcde:4200/userexists/' + elem.value)
            .then(function(response) {
                return response.json();
            })
            .then(function(handleInvalidUser) {
                if (handleInvalidUser)
                    return elem.className = 'invalid-input';
            })
        }

        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();

            let isValid = true;
            registerFormInputs.forEach((input) => {
                if (!isValid) return;

                if (input.className !== 'valid-input')
                    return isValid = false
                else if (input.className === '')
                    return isValid = true
            });

            if (isValid) 
                submitBtn.parentNode.submit();
        });
    }
}

let navigationFormsModalActivation = () => {
    if (document.querySelector('.nav-bar')) {
        const nav = document.querySelector('.nav-bar');
        const formOptions = document.querySelectorAll('.form');

        // show or hide login/register form on nav click 
        nav.addEventListener('click', (e) => {
            if (e.target.tagName == "BUTTON") {

                // get the form in which data-target (at index.html file) points to
                const targetForm = document.querySelector(e.target.dataset.target);

                // change to active if not, remove active if class has active
                formOptions.forEach((form) => {
                    if (form == targetForm) {
                        if (form.classList.contains('active')) {
                            form.classList.remove('active');
                        } else {
                        form.classList.add('active');
                        }
                    } else {
                        form.classList.remove('active');
                    }
                });
            }
        });
    }
}

let curriculumFormConfiguration = () => {
    if (document.getElementById('curriculum-form')) {

        handleNewContentInputCreation()

        handleNewSectionCreation()

        document.getElementById('submit-curriculum').addEventListener('click', () => {
            if(isFormInputsValid()) document.getElementById('curriculum-form').submit()
        });

    }

    function handleNewContentInputCreation() {
        let sections = document.querySelectorAll('.curriculum-section');

        sections.forEach((sectionContents) => {
            let sectionContentsLength = sectionContents.children.length;

            for (let i = 2; i < sectionContentsLength; i+=2) {
                // section-content (i), content-link (i+1) and parent node as parameters
                createNewContentInput(sectionContents.children[i], sectionContents.children[i+1], sectionContents);
            }
        });
    }

    function createNewContentInput(sectionContents, sectionContentLinks, section) {

        sectionContents.addEventListener('focusout', createInput);

        function createInput(event) {
        
            // make sure event will occour only one time
            event.target.removeEventListener('focusout', createInput);

            let newSectionContent = sectionContents.cloneNode(false);
            let newContentLink = sectionContentLinks.cloneNode(false);

            newSectionContent.value = "";
            newContentLink.value = "";

            createNewContentInput(newSectionContent, newContentLink, section);

            section.appendChild(newSectionContent);
            section.appendChild(newContentLink);
        }
    }

    function handleNewSectionCreation() {
        let newSectionBtn = document.getElementById('new-section-btn');
            newSectionBtn.addEventListener('click', () => {
                createNewSection();
            });

        let section = document.querySelector('.curriculum-section');
        let sectionContent = document.querySelector('.section-content');
        let contentLink = document.querySelector('.content-link');
        let sectionsDiv = document.getElementById('curriculum-sections');

        function createNewSection() {

            let newSection = section.cloneNode(false);

            let sectionsLength = document.querySelectorAll('.section-title').length;
            newSection.setAttribute('name', 'curriculumSection' + sectionsLength);

            let newSectionContent = sectionContent.cloneNode(false);
            newSectionContent.setAttribute('name', 'sectionContent' + sectionsLength);

            let newContentLink = contentLink.cloneNode(false);
            newContentLink.setAttribute('name', 'contentLink' + sectionsLength);

            createNewContentInput(newSectionContent, newContentLink, newSection);
            
            let newSectionTitle = document.querySelector('.section-title').cloneNode(false);
            let newSectionExplanation = document.querySelector('.section-textarea').cloneNode(false);
            newSectionExplanation.setAttribute('name', 'sectionExplanation' + sectionsLength);

            newContentLink.value = newSectionContent.value = newSectionTitle.value = newSectionExplanation.value = "";

            sectionsDiv.appendChild(newSection);
            newSection.appendChild(newSectionTitle);
            newSection.appendChild(newSectionExplanation);
            newSection.appendChild(newSectionContent);
            newSection.appendChild(newContentLink);
        }
    }

    function isFormInputsValid() {
        let fields = []

        fields[0] = document.querySelector('.curriculum-title-form');
        fields[1] = document.querySelector('.section-content');
        fields[2] = document.querySelector('.content-link');

        let isValid = true;

        fields.forEach(field => {
            if (field.value == '') {
                field.classList.add('invalid-input');
                isValid = false;
            }

            field.addEventListener('keydown', () => {
                field.classList.remove('invalid-input');
            });
            
        });

        return isValid;
    }

}

let getAndShowCurriculaFromSearchBox = () => {
    if (document.getElementById('search-box')) {
        let searchBox = document.getElementById('search-box');
        let http = new XMLHttpRequest();    

        let parentDIV = document.createElement('div');
        parentDIV.className = 'user-curricula';
        document.body.appendChild(parentDIV);

        http.onreadystatechange = () => {
            if (http.readyState == 4) {
                if(document.querySelector('.msg'))
                    document.querySelector('.msg').remove();

                if (http.status == 200) {
                    JSON.parse(http.response).forEach((curriculumData) => {
                        createDivWithCurriculumData(curriculumData);
                });
                } else {
                    let msg = document.createElement('div');
                    msg.className = 'msg';
                    msg.innerHTML = 'No curriculum was found!'
                    document.body.appendChild(msg);
                }
            }
        };

        let createDivWithCurriculumData = function(curriculumData) {
            let curriculumDIV = document.createElement('div');
            curriculumDIV.className = 'curriculum-title';
            
            let content = document.createElement('a');
            content.innerHTML = curriculumData.curriculum.curriculumTitle;
            content.setAttribute('href', '/curriculum/' + curriculumData.curriculum._id);

            let userAnchorTag = document.createElement('a');
            userAnchorTag.href = '/user/' + curriculumData.user;
            userAnchorTag.textContent = 'by ' + curriculumData.user;

            curriculumDIV.appendChild(content);
            curriculumDIV.appendChild(userAnchorTag);
            parentDIV.appendChild(curriculumDIV);
        };

        searchBox.addEventListener('keydown', (e) => {
            if (e.keyCode == 13) { // 'Enter' key

                if (document.querySelector('.container > div:not(.menu)')) 
                    document.querySelector('.container > div:not(.menu)').remove();

                // when new request is made, remove all active curriculum in page
                document.querySelectorAll('.curriculum-title').forEach((curriculumTitle) => {
                    curriculumTitle.remove();
                });

                http.open("GET", "/curriculum/get/" + searchBox.value, true);
                http.send();
            }
        });
    }
}

let requestToSaveCurriculumInDB = () => {
    if (document.getElementById('save-curriculum')) {

        let saveCurriculumBtn = document.getElementById('save-curriculum');
        
        saveCurriculumBtn.addEventListener('click', function() {
            http.open("POST", "/curriculum/save/" + curriculumID, true);
            http.send();
        });

        // get the curriculum id in current url, last 24 characters
        let curriculumID = window.location.href.substr(-24);

        let http = new XMLHttpRequest();

        http.onreadystatechange = function() {
            if (http.readyState == 4) {
                window.location.href = '/curricula/saved';
            }
        }
    }
}

let requestToDeleteCurriculumInDB = () => {
    if (document.querySelectorAll('delete-curriculum')) {

        let deleteCurriculumBtn = document.querySelectorAll('.delete-curriculum');

        deleteCurriculumBtn.forEach(btn => {
            btn.addEventListener('click', (e) => {
                let id = e.target.dataset.id;
                removeCurriculumRequest(id);
            });
        });
        
        let http = new XMLHttpRequest();

        http.onreadystatechange = () => {
            if (http.readyState == 4) {
                if (JSON.parse(http.response).ok === 1)
                    location.reload()
            }
        }

        let removeCurriculumRequest = (id) => {

            if (window.location.href.substr(-5) == 'saved')
                http.open('DELETE', '/saved/curricula/delete/' + id, true);
            else
                http.open('DELETE', '/curriculum/delete/' + id, true);

            http.send();
        }
    }
}

})()