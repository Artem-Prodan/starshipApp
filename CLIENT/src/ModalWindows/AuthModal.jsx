import React, { useRef, useState, useEffect } from "react";
import "./WelcomeModals.css";


const SignInModal = ({ onClose, onLoginSuccess }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false);

    const passwordRef = useRef(null); //ref for autofocus on next input field

    const [emailTouched, setEmailTouched]=useState(false);
    const [passwordTouched, setPasswordTouched]=useState(false);
    const [submitTouched, setSubmitTouched]=useState(false);

    //autofocus to password field after clicking "Enter" inside "email"
    const handleEmailKeyDown = (e) => {

        if (e.key === "Enter") {
            e.preventDefault();
            setEmailTouched(true);

            if(!email){
                setEmailError("This field is required");
            } else if (email.includes("@")) {
                setEmailError("");
                passwordRef.current?.focus();//autofocus to password
            } else {
                setEmailError("Please enter a valid email address.");
            }
        }
    };

     //auto submit after clicking "Enter" inside "password"
    const handlePasswordKeyDown = (e) => {
        if (e.key === "Enter") {
            setPasswordTouched(true);
            setSubmitTouched(true);
     };
    }

    useEffect(() => {
        //block scrolling when modal window is open
        document.body.style.overflow = "hidden";
        //enable scrolling when modal window is closed
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleOverlayClick = (e) => {
        //close the modal window if you click on the background
        if (e.target.classList.contains("modal-overlay")) {
            onClose();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); //cancels page reload and data reset inside of input fields
        setSubmitTouched(true);

        let validInput = true;

        if (!email) {
            setEmailError("This field is required.");
            validInput = false;
        } else if (!email.includes("@")) {
            setEmailError("Please enter a valid email address.");
            validInput = false;
        } else {
            setEmailError("");
        }

        if (!password) {
            setPasswordError("This field is required.");
            validInput = false;
        } else if (password.length < 5) {
            setPasswordError("Password must be at least 5 characters long.");
            validInput = false;
        } else {
            setPasswordError("");
        }

        if (!validInput) return;

        // feedback
        setIsLoading(true);
    try {
        const response = await fetch("http://localhost:4000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Login failed");
        }

        const data = await response.json();
        setLoginSuccess(true);

        localStorage.setItem("token", data.token);

        onLoginSuccess({
            username: data.nickname,
            avatarUrl: "/defaultProfLogo.jpg",
            email: data.email,
        });

    } catch (err) {
        console.error("Login error:", err.message);
        alert("❌ " + err.message);
    } finally {
        setIsLoading(false);
    }
};

   return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal-title">Sign In</h2>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        {(emailTouched || submitTouched) && emailError &&
                            <p className="error-message">{emailError}</p>}
                        <input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                if (value.includes("@")) {
                                    setEmailError("");
                                }
                            }}
                            onKeyDown={handleEmailKeyDown}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        {(passwordTouched || submitTouched) && passwordError &&
                            <p className="error-message">{passwordError}</p>}
                        <input
                            ref={passwordRef}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                const value = e.target.value;
                                setPassword(value);
                                if (value.length >= 5) {
                                    setPasswordError("");
                                }
                            }}
                            onKeyDown={handlePasswordKeyDown}
                        />
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Logging in..." : "Log In"}
                    </button>
                </form>

                {loginSuccess && (
                    <div className="success-message">✅  - Login successful!</div>
                )}

                <button className="close-button" onClick={onClose}>X</button>
            </div>
        </div>
    );

};

const SignUpModal = ({ onClose, onRegisterSuccess }) => {
    const [nickname, setNickname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [nicknameError, setNicknameError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessBanner, setShowSuccessBanner] = useState(false);

    const emailRef = useRef(null); //ref for autofocus on next input field
    const passwordRef = useRef(null); 


    //to check if input field was touched
    const [nicknameTouched, setNicknameTouched] = useState(false);
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [submitTouched, setSubmitTouched] = useState(false);

   //autofocus to email field after clicking "Enter" inside "nickname"
    const handleNicknameKeyDown = (e) => {
       

        if (e.key === "Enter") {
            e.preventDefault(); //cancels submition of all input fields at a time
            setNicknameTouched(true);

            if(!nickname) {
                setNicknameError("This field is required.");
            } else if(nickname.length <2) {
                setNicknameError("Nickname must be at least 2 characters long.");
            } else if (nickname.length > 16) {
                setNicknameError("Nickname is too long.");
            } else {
                setNicknameError("");
                emailRef.current?.focus();
            }
        }
    };

    //autofocus to password field after clicking "Enter" inside "email"
    const handleEmailKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setEmailTouched(true);

             if(email.length ===0){
                setEmailError("This field is required.");
             }else if (email.includes("@")) {
                setEmailError("");
                passwordRef.current?.focus();
            } else {
                setEmailError("Please enter a valid email address.");
            }
        }
    };

    //auto submit after clicking "Enter" inside "password"
    const handlePasswordKeyDown = (e) => {
        if (e.key === "Enter") {
            setPasswordTouched(true);
            setSubmitTouched(true);
     };
    }


    useEffect(() => {
        //block scrolling when modal window is open
        document.body.style.overflow = "hidden";
        //enable scrolling when modal window is closed
        return () => {
            document.body.style.overflow = "";
        };
    }, []);

    const handleOverlayClick = (e) => {
        //close the modal window if you click on the background
        if (e.target.classList.contains("modal-overlay")) {
            onClose();
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); //cancels page reload and data reset inside of input fields
        setSubmitTouched(true);

        let validInput = true;

                if (!nickname) {
                    setNicknameError("This field is required.");
                    validInput = false;
                } else if (nickname.length < 2) {
                    setNicknameError("Nickname must be at least 2 characters long.");
                    validInput = false;
                } else if (nickname.length > 16){
                    setNicknameError("Nickname is too long.")
                    validInput = false;
                } else {
                    setNicknameError("");
                }

                 if (!email) {
                    setEmailError("This field is required.");
                    validInput = false;
                } else if (!email.includes("@")) {
                    setEmailError("Please enter a valid email address.");
                    validInput = false;
                } else {
                    setEmailError("");
                }   

                 if (!password) {
                    setPasswordError("This field is required.");
                    validInput = false;
                } else if (password.length < 5) {
                    setPasswordError("Password must be at least 5 characters long.");
                    validInput = false;
                } else {
                    setPasswordError("");
                }

        if (!validInput) return;

        // feedback
         setIsLoading(true);
    try {
        const response = await fetch("http://localhost:4000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nickName: nickname,
                email,
                password
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.message || "Registration failed");
        }

        setIsLoading(false);
        setShowSuccessBanner(true);
    } catch (err) {
        console.error("Registration error:", err.message);
        setIsLoading(false);
        alert("❌ " + err.message);
    }
};

    const handleCloseBanner = () => {
        setShowSuccessBanner(false);
        onRegisterSuccess();
        onClose();
    };

return (
    <>
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                <h2 className="modal-title">Sign Up</h2>
                
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        {(nicknameTouched || submitTouched) && nicknameError &&
                            <p className="error-message">{nicknameError}</p>}
                        <input
                            type="text"
                            placeholder="Nickname"
                            value={nickname}
                            onChange={(e) => {
                                const value = e.target.value;
                                setNickname(value);
                                if (value.length >= 2) {
                                    setNicknameError("");
                                }
                            }}
                            onKeyDown={handleNicknameKeyDown}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        {(emailTouched || submitTouched) && emailError &&
                            <p className="error-message">{emailError}</p>}
                        <input
                            ref={emailRef}
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                if (value.includes("@")) {
                                    setEmailError("");
                                }
                            }}
                            onKeyDown={handleEmailKeyDown}
                        />
                    </div>

                    <div className="form-group">
                        {(passwordTouched || submitTouched) && passwordError &&
                            <p className="error-message">{passwordError}</p>}
                        <input
                            ref={passwordRef}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => {
                                const value = e.target.value;
                                setPassword(value);
                                if (value.length >= 5) {
                                    setPasswordError("");
                                }
                            }}
                            onKeyDown={handlePasswordKeyDown}
                        />
                    </div>

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? "Registration process..." : "Register"}
                    </button>
                </form>

                <button className="close-button" onClick={onClose}>X</button>
            </div>
        </div>

        {showSuccessBanner && (
            <NotificationBanner
                message="✅ - Registration successful!"
                onClose={handleCloseBanner}
            />
        )}
    </>
);


}


const NotificationBanner = ({ message, onClose }) => {
    return (
        <div className="notification-overlay">
        <div className="notification-banner" >
            <div className="notification-content">
                <p>{message}</p>
                <button onClick={onClose}>OK</button>
            </div>
        </div>
      </div>
    );
};

export { SignInModal, SignUpModal };
