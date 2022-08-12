# TinyApp with Darkmode

TinyApp is a RESTful full stack web application built with Node and Express that allows users to shorten long URLs like bit.ly or tiny.url! This app has user logins and user-specific links, and has a *dark-mode theme*.

## Final Product

|Login Screen|
|---|
| ![Login Screen](/sampleImages/LoginPage.png) |
|**Logged in User view**|
|![URLs Screen](/sampleImages/urlspage.png)|

User Feature-List:

* > Users can register by email
* > Can create personal shortened links which are shareable with anyone
* > The user can track how many times their shortened links are clicked
* > Users can edit and update the destination URLS, or delete them if they no longer want them.
* > Only they can edit and delete links they created!

## Dependencies

- Express
- bcryptjs
- EJS
- cookie-session.
- Node.js
- method-override

### Dev Dependencies
- mocha
- chai
- morgan (was made to uninstall but recommend if you work on it)


# Server Setup and Information

For first time setup, use the following commands: 

```
npm install
npm run tinyappsetup
npm run tinyapp 
```
After, you can simply run the server with: 
```
npm run tinyapp
```

If your server databases ever break, you can run ``npm run tinyappsetup`` again and it will clean them. Do not do this again if you like your databases, back them up even. **:)**

### Server Features:

* **User PWs are hashed**
* **Cookies are encrypted**
* **_Server runs off local json files which are created on setup, preserving state!_**
* Constants are easy to customize in the constants.js folder
* For devs, there are some debug functions built in.
* Server sends html in a darkmode, so you can feel *superior* over lightmode tinyApps.
* Uses https://http.cat API for some specific user errors.

> Heaped together from scraps by [@sachieko](https://github.com/sachieko).
Issues? Let me know!

<details><summary>More Visuals!</summary>
<p>

|Editing links page|
|---|
|!["screenshot description"](/sampleImages/editpage.png)|
|**Creating a new URL page**|
|!["screenshot description"](/sampleImages/newurlpage.png)|
|**What users see when trying to access another's content**|
|!["screenshot description"](/sampleImages/meddlingwarning.png)|
</p>
</details>