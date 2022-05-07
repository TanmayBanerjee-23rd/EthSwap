import React, { Component } from "react";
import Identicon from "identicon.js";

class Navbar extends Component {

    render() {
        return (
            <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                <a
                    className="navbar-brand col-sm-3 col-md-2 mr-0"
                    href="http://www.dappuniversity.com/bootcamp"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Eth Swap
                </a>

                <ul className="navbar-nav px-3">
                    <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
                        <small className="text-secondary">
                            <small id="userAccount">
                                { this.props.userAccount }
                            </small>
                        </small>
                    
                        {
                            this.props.userAccount ?
                            <img 
                            className="ml-2"
                            width={30}
                            height={30}
                            src={`data:image/png;base64,${ new Identicon( this.props.userAccount, 30 ).toString()}`}
                            alt="Identicon"/>
                            :
                            <></>
                        }
                    </li>

                </ul>
            </nav>
        )
    }
};

export default Navbar;
