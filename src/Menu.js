import React from 'react'
import './Menu.css'
import { ReactComponent as MailIcon } from './mail.svg';
import { ReactComponent as TumblrIcon } from './tumblr.svg';
import { ReactComponent as BlueSkyIcon } from './blue.svg';

const Menu = () => {
    return (
        <>
            <footer className="footer">
            <div className="social">
                    <a href="mailto:leoreadss1941@gmail.com" target="_blank" rel="noopener noreferrer" className="icon">
                        <MailIcon width={24} height={24} />
                    </a>
                    <a href="https://leoreadss.tumblr.com/" target="_blank" rel="noopener noreferrer" className="icon">
                        <TumblrIcon width={24} height={24} />
                    </a>
                    <a href="https://bsky.app/profile/leoreadss.bsky.social" target="_blank" rel="noopener noreferrer" className="icon">
                        <BlueSkyIcon width={24} height={24} />
                    </a>
                </div>
            </footer>
        </>
    )
}

export default Menu