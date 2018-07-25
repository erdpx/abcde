const saveCurriculum = data => {
    
    let sectionsLength;
    if (Array.isArray(data.sectionTitle)) {
        sectionsLength = data.sectionTitle.length;
    } else {
        sectionsLength = 1;
    }

    let curriculumContent = [];

    for (let i = 0; i < sectionsLength; i++) {

        let sectionTitle;
        sectionsLength > 1 ? sectionTitle = data.sectionTitle[i] : sectionTitle = data.sectionTitle;

        // data will contain the sectionContent and contentLink of sections separated by
        // the number that goes in the end, hence, adding 'i'
        let sectionContentQuery = 'sectionContent' + i;
        let contentLinkQuery = 'contentLink' + i;

        let sectionContent;
        if (Array.isArray(data[sectionContentQuery]))
            sectionContent = clearEmptySpacesInArray(data[sectionContentQuery]);
        else  
            sectionContent = data[sectionContentQuery];

        let contentLink;
        if (Array.isArray(data[contentLinkQuery]))
            contentLink = clearEmptySpacesInArray(data[contentLinkQuery]);
        else    
            contentLink = data[contentLinkQuery];

        let sectionExplanationQuery = 'sectionExplanation' + i;

        let contentObj;
        if (data[sectionExplanationQuery]) {
            contentObj = {
                "sectionTitle": sectionTitle,
                "content": sectionContent,
                "contentLink": contentLink,
                "sectionExplanation": data[sectionExplanationQuery]
            }
        } else {
            contentObj = {
                "sectionTitle": sectionTitle,
                "content": sectionContent,
                "contentLink": contentLink
            }
        }

        curriculumContent.push(contentObj)
    }

    let curriculumData = {};

    if (data.curriculumExplanation) {
        curriculumData = {
            "curriculumTitle": data.curriculumTitle,
            "curriculumSections": curriculumContent,
            "curriculumExplanation": data.curriculumExplanation
        }
    } else {
        curriculumData = {
            "curriculumTitle": data.curriculumTitle,
            "curriculumSections": curriculumContent
        }
    }

    return curriculumData;
}

const clearEmptySpacesInArray = array => {
    if (!Array.isArray(array)) return array.length

    return array.filter(n => n != "");
}

module.exports = {saveCurriculum, clearEmptySpacesInArray}