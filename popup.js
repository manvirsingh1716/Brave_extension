document.addEventListener('DOMContentLoaded', () => {
    const folderNameInput = document.getElementById('folderName');
    const saveTabsButton = document.getElementById('saveTabs');
    const saveCurrentTabButton = document.getElementById('saveCurrentTab');
    const removeFolderButton = document.getElementById('removeFolder');
    const folderList = document.getElementById('folderList');

    // Load folders from storage
    loadFolders();

    // Event listener to save current tabs to a folder
    saveTabsButton.addEventListener('click', () => {
        const folderName = folderNameInput.value.trim();
        if (folderName) {
            saveCurrentTabs(folderName);
            folderNameInput.value = '';
        }
    });

    // Event listener to save the current tab to a folder
    saveCurrentTabButton.addEventListener('click', () => {
        const folderName = folderNameInput.value.trim();
        if (folderName) {
            saveCurrentTab(folderName);
            folderNameInput.value = '';
        }
    });

    // Event listener to remove a folder
    removeFolderButton.addEventListener('click', () => {
        const folderName = folderNameInput.value.trim();
        if (folderName) {
            removeFolder(folderName);
            folderNameInput.value = '';
        }
    });

    // Function to save current tabs to a folder
    function saveCurrentTabs(folderName) {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
            const tabUrls = tabs.map(tab => tab.url);
            chrome.storage.local.get({ folders: {} }, (result) => {
                const folders = result.folders;
                folders[folderName] = tabUrls;
                chrome.storage.local.set({ folders }, () => {
                    loadFolders();
                });
            });
        });
    }

    // Function to save the current tab to a folder
    function saveCurrentTab(folderName) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTabUrl = tabs[0].url;
            chrome.storage.local.get({ folders: {} }, (result) => {
                const folders = result.folders;
                if (!folders[folderName]) {
                    folders[folderName] = [];
                }
                folders[folderName].push(currentTabUrl);
                chrome.storage.local.set({ folders }, () => {
                    loadFolders();
                });
            });
        });
    }

    // Function to load folders from storage and display them
    function loadFolders() {
        chrome.storage.local.get({ folders: {} }, (result) => {
            const folders = result.folders;
            folderList.innerHTML = '';
            for (const folderName in folders) {
                const folderItem = document.createElement('li');
                folderItem.textContent = folderName;
                folderItem.addEventListener('click', () => {
                    displayFolderTabs(folderName, folders[folderName]);
                });
                folderList.appendChild(folderItem);
            }
        });
    }

    // Function to display tabs in a folder
    function displayFolderTabs(folderName, tabUrls) {
        const folderTabs = document.createElement('div');
        folderTabs.innerHTML = `<h3>${folderName}</h3>`;
        const tabList = document.createElement('ul');
        tabUrls.forEach(url => {
            const tabItem = document.createElement('li');
            tabItem.textContent = url;
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent opening the tab when clicking the remove button
                removeTabFromFolder(folderName, url);
            });
            tabItem.appendChild(removeButton);
            tabItem.addEventListener('click', () => {
                chrome.tabs.create({ url });
            });
            tabList.appendChild(tabItem);
        });
        folderTabs.appendChild(tabList);
        folderList.innerHTML = '';
        folderList.appendChild(folderTabs);
    }

    // Function to remove a tab from a folder without closing it
    function removeTabFromFolder(folderName, url) {
        chrome.storage.local.get({ folders: {} }, (result) => {
            const folders = result.folders;
            if (folders[folderName]) {
                folders[folderName] = folders[folderName].filter(tabUrl => tabUrl !== url);
                chrome.storage.local.set({ folders }, () => {
                    loadFolders();
                });
            }
        });
    }

    // Function to remove a folder
    function removeFolder(folderName) {
        chrome.storage.local.get({ folders: {} }, (result) => {
            const folders = result.folders;
            if (folders[folderName]) {
                delete folders[folderName];
                chrome.storage.local.set({ folders }, () => {
                    loadFolders();
                });
            }
        });
    }
});
