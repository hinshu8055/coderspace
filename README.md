# Coderspace 🚀 

A **real-time collaborative coding platform** that enables multiple developers to code together seamlessly, featuring **live code execution**, **typing indicators**, and **multi-language support**.

### 🔗 [Live Link](https://Coderspace-3yjo.onrender.com/)



## ✨ Features


- 🔄 **Real-time Collaboration** – Multiple users can edit code simultaneously  
- ⚡ **Live Code Execution** – Run code instantly with support for multiple programming languages  
- 👥 **User Presence** – See who's currently in the room and typing  
- 🌐 **Multi-language Support** – JavaScript, Python, Java, and C++  
- 🎨 **Modern UI** – Clean, dark-themed interface powered by Monaco Editor (VS Code's engine)  
- 📱 **Responsive Design** – Works seamlessly across desktop and mobile devices  
- 🔗 **Easy Room Sharing** – Simple room ID system for quick collaboration setup  



## 🛠️ Tech Stack


### **Frontend**
- **React** – UI framework with modern hooks  
- **Monaco Editor** – Rich code editing experience (VS Code's editor)  
- **Socket.IO Client** – Real-time bidirectional communication  
- **Axios** – HTTP client for API requests  
- **CSS3** – Custom styling with gradients and animations  

### **Backend**
- **Node.js** – JavaScript runtime  
- **Express.js** – Web application framework  
- **Socket.IO** – WebSocket communication with fallback support  
- **Piston API** – Secure sandboxed code execution  
- **CORS** – Cross-origin resource sharing  



## 🚀 Quick Start



```

**Install backend dependencies**
```bash
npm install
```

**Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

**Build the frontend**
```bash
cd frontend
npm run build
cd ..
```

**Start the server**
```bash
npm start
```

**Open your browser**
```
http://localhost:5000
```



### **Development Mode**
For development:

**Start the backend server**
```bash
npm run dev
```

**In a new terminal, start the frontend**
```bash
cd frontend
npm run dev
```

**Access the application**
- **Frontend:** http://localhost:5173  
- **Backend:** http://localhost:5000  



## 📖 How to Use


### **Create / Join a Room**
1. Enter a unique Room ID  
2. Add your username  
3. Click **"Join Room"**  

### **Start Collaborating**
1. Write code in the Monaco editor  
2. See real-time changes from other users  
3. Watch typing indicators to see who's active  

### **Execute Code**
1. Select your programming language  
2. Click **"Run"** to execute code  
3. View output in the integrated console  

### **Share Your Room**
1. Copy the Room ID using the **"Copy Id"** button  
2. Share with teammates to start collaborating  



## 🏗️ Project Structure


```plaintext
/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── App.jsx          # Main React component
│   │   ├── App.css          # Styles and animations
│   │   └── main.jsx         # React entry point
│   ├── dist/                # Built frontend files
│   └── package.json         # Frontend dependencies
├── backend/                 # Backend application
│   ├── index.js             # Express server and Socket.IO setup
│   └── package.json         # Backend dependencies
└── README.md                # Project documentation
```





## 🔧 Configuration


### **Supported Languages**
Currently supports:
- JavaScript  
- Python 3  
- Java  
- C++  

**To add more languages:**
- Update the language selector in `App.jsx`  
- Ensure Piston API supports them  



### **Customization**
- **Editor Theme:** Modify Monaco editor theme in `App.jsx`  
- **UI Colors:** Update CSS variables in `App.css`  
- **Socket Configuration:** Adjust Socket.IO settings in `index.js`  

## 🤝 Contributing


We welcome contributions from the community!  

### **Steps to Contribute**
1. **Fork** the repository  
2. **Create a feature branch**  
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**  
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**  
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**  

---

Made with ❤️ for the developer community.  
**Happy Coding! 🎉**
