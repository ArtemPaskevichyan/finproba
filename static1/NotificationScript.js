var FNNotificationQueue = []
var notifications = []
let notificationInterval = 5000


function addNotificationToQueue(title,imagePath, message, buttons){
    let notification = {
    title: title,
    imagePath: imagePath,
    message: message,
    buttons: buttons
    }
    console.log("KSJNFKSJNFD", notification, FNNotificationQueue);
    FNNotificationQueue.push(notification)
    addNotification(title, imagePath, message, buttons)
}

function addNotification(title,imagePath, message, buttons){
    let notification = {
      title: title,
      imagePath: imagePath,
      message: message,
      created: new Date(),
      buttons: buttons
    }
    console.log("uuuuu", notifications);
    let request = notifications.add(notification); // (3)

    request.onsuccess = function() { // (4)
      console.log("Уведомление добавлена в хранилище", request.result);
    };

    request.onerror = function() {
      console.log("Ошибка", request.error);
    };
}

function fetchDataFromNotificationQueue() {
    for (var notification of FNNotificationQueue){
        FNNotificationCall(notification.title, notification.imagePath, notification.message, notification.buttons)

    }
    FNNotificationQueue = []
}



let openRequest = indexedDB.open("store", 1);

openRequest.onupgradeneeded = function() {
  let db = openRequest.result;
  if (!db.objectStoreNames.contains('notifications')) {
    db.createObjectStore('notifications', {autoIncrement: true});
  }

};

openRequest.onerror = function() {
  console.error("Error", openRequest.error);
};

openRequest.onsuccess = function() {
  let db = openRequest.result;
  console.log('okopopopopopopo')


  let transaction = db.transaction("notifications", "readwrite");

// получить хранилище объектов для работы с ним
    notifications = transaction.objectStore("notifications");


    setInterval(fetchDataFromNotificationQueue(),notificationInterval)

};
