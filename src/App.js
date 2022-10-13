import {useState, useEffect} from "react";
import {octokit} from "./API/octokit";
import axios from "axios";
import SyntaxHighlighter from "react-syntax-highlighter";
import {githubGist} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import React from "react";
import 'semantic-ui-css/semantic.min.css';
import { Form, Message } from 'semantic-ui-react';
import './App.css';
import Moment from 'moment';

function App() {

    const [gists, setGists] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [input, setInput] = useState('');
    const gistsObj = [], ownerObj = [];
    const [owner, setOwner] = useState([]);
    let [pageCount, setCount] = useState(1);

    async function fetchData(user, pageCount) {

        await octokit.request('GET /users/{username}/gists', {
            username: user,
            per_page: 1,
            page: pageCount
        })
            .then(res => {

                setErrorMessage('');
                setGists([]);
                setOwner([]);

                const asyncMap = async res => {

                    const promises = res.data.map(async gist => {

                        for (const [key, value] of Object.entries(gist.files)) {

                            await axios.get(value.raw_url)
                                .then(function (codeSnippet) {
                                    return codeSnippet.data;
                                })
                                .then(function (codeSnippet) {
                                    value.code = codeSnippet;

                                    switch(value.language) {
                                        case 'Markdown':
                                            value.language_url = 'https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white';
                                            break;
                                        case 'JavaScript':
                                            value.language_url = 'https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black';
                                            break;
                                        case 'PHP':
                                            value.language_url = 'https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white';
                                            break;
                                        case '.NET':
                                            value.language_url = 'https://img.shields.io/badge/.NET-5C2D91?style=for-the-badge&logo=.net&logoColor=white';
                                            break;
                                        case 'CSS':
                                            value.language_url = 'https://img.shields.io/badge/CSS-239120?&style=for-the-badge&logo=css3&logoColor=white';
                                            break;
                                        case 'HTML':
                                            value.language_url = 'https://img.shields.io/badge/HTML-239120?style=for-the-badge&logo=html5&logoColor=white';
                                            break;
                                        case 'Python':
                                            value.language_url = 'https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white';
                                            break;
                                        case 'Node.js':
                                            value.language_url = 'https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white';
                                            break;
                                        default:
                                            value.language_url = ''
                                    }
                                });

                        }

                        await octokit.request('GET /gists/{gist_id}/forks', {
                            gist_id: gist.id
                        }).then(function (res) {
                            gist.forksUpdated = res.data;

                            let dateObj = new Date(gist.created_at.split("T")[0]);
                            let momentObj = Moment(dateObj);
                            gist.created_at = momentObj.format('MMM Do YYYY');

                            gistsObj.push(gist);
                        })
                    });

                    await Promise.all(promises);

                    await (async () => {
                        await axios.get('https://api.github.com/users/' + gistsObj[0].owner.login)
                            .then(function (res) {

                                let dateObj = new Date(res.data.created_at.split("T")[0]);
                                let momentObj = Moment(dateObj);
                                res.data.created_at = momentObj.format('MMM Do YYYY');

                                ownerObj.push(res.data);
                            });
                    })();

                    if(gistsObj.length === 0) {
                        setErrorMessage('The user was correct, but it has no public gists.');
                        return;
                    }

                    setOwner(ownerObj);
                    setGists(gistsObj);

                    console.log(gistsObj)
                    console.log(ownerObj)

                    document.querySelector('.ui.button').disabled = false;

                }

                asyncMap(res);

            }).catch(() => {
                setGists([]);
                setErrorMessage('We couldn\'t find any user with that name.');
            })

    }

    function handlePrevPage() {

        if(pageCount <= 1) {
            return;
        }

        setCount(pageCount -= 1);

        fetchData(input, pageCount);
    }

    function handleNextPage() {

        if(pageCount >= owner[0].public_gists) {
            return;
        }

        setCount(pageCount += 1);

        fetchData(input, pageCount);

    }

    const handleChange = event => {

        document.querySelector('.ui.button').disabled = true;

        setCount(1);

        setInput(event.target.name.value);

        fetchData(event.target.name.value, 1);

    };

    function handleDisplay(e) {
        document.querySelector('.codeSnippets').style.display = "none";
        document.querySelector('.displayCodeSnippet').style.display = "block";
        e.target.style.display = "none";
        e.target.nextElementSibling.style.display = "block";
    }

    return (
        <div className="App">
            <div className="header">
                <h1> Github gists collector </h1>
                <div className="search">
                    <Form onSubmit={handleChange} className="formControl">
                        <Form.Group>
                            <Form.Input placeholder="Search by name" name="name" />
                            <Form.Button content="Search" className="submitBtn"  />
                        </Form.Group>
                        {errorMessage && (
                            <Message header="Oh no!" content={errorMessage} />
                        )}
                    </Form>
                </div>
            </div>
            {owner.length > 0 && (
                <div className="userCard">
                    <div className="userDetails">
                        <div className="avatarContainer">
                            <img src={owner[0].avatar_url} alt="avatar" className="avatarImg" />
                            <a href={`https://github.com/${owner[0].login}`} target="_blank" className="userName">{owner[0].login}</a>
                        </div>
                        <div className="userExtras">
                            <div className="additionalData">
                                <span className="additionalText">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-people" viewBox="0 0 16 16">
                                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1h8zm-7.978-1A.261.261 0 0 1 7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002a.274.274 0 0 1-.014.002H7.022zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM6.936 9.28a5.88 5.88 0 0 0-1.23-.247A7.35 7.35 0 0 0 5 9c-4 0-5 3-5 4 0 .667.333 1 1 1h4.216A2.238 2.238 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816zM4.92 10A5.493 5.493 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275zM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                                    </svg>
                                    {owner[0].followers}
                                </span>
                                <span className="additionalText">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-megaphone" viewBox="0 0 16 16">
                                        <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.405 2.712A1 1 0 0 1 5.51 15.1h-.548a1 1 0 0 1-.916-.599l-1.85-3.49a68.14 68.14 0 0 0-.202-.003A2.014 2.014 0 0 1 0 9V7a2.02 2.02 0 0 1 1.992-2.013 74.663 74.663 0 0 0 2.483-.075c3.043-.154 6.148-.849 8.525-2.199V2.5zm1 0v11a.5.5 0 0 0 1 0v-11a.5.5 0 0 0-1 0zm-1 1.35c-2.344 1.205-5.209 1.842-8 2.033v4.233c.18.01.359.022.537.036 2.568.189 5.093.744 7.463 1.993V3.85zm-9 6.215v-4.13a95.09 95.09 0 0 1-1.992.052A1.02 1.02 0 0 0 1 7v2c0 .55.448 1.002 1.006 1.009A60.49 60.49 0 0 1 4 10.065zm-.657.975 1.609 3.037.01.024h.548l-.002-.014-.443-2.966a68.019 68.019 0 0 0-1.722-.082z"/>
                                    </svg>
                                    {owner[0].public_gists}
                                </span>
                                <span className="additionalText">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-box-seam" viewBox="0 0 16 16">
                                        <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                                    </svg>
                                    {owner[0].public_repos}
                                </span>
                            </div>
                            <div className="userDescription"> "{owner[0].bio}" </div>
                            <div className="joinDate"> ~ {owner[0].created_at} </div>
                        </div>
                    </div>
                </div>
            )
            }
            <div className="content">
                    {gists.map((item) => (
                        <div className="gist">
                            <button className="displayCodeSnippet" onClick={handleDisplay}> Display snippets </button>
                            <div className="codeSnippets">
                                {Object.values(item.files).map((snippet) => (
                                    <div className="codeContainer">
                                        <div className="gistDetails">
                                            <div className="snippetLang">
                                                {snippet.language_url.length > 0 && (
                                                    <img src={snippet.language_url}  alt="language" />
                                                )}
                                                <span> {snippet.filename} </span>
                                            </div>
                                            <span className="smallDate"> {item.created_at} </span>
                                        </div>
                                        <SyntaxHighlighter language={snippet.language} style={githubGist} wrapLines={true} wrapLongLines={true} showLineNumbers={true}>
                                            {snippet.code}
                                        </SyntaxHighlighter>
                                    </div>
                                ))}
                            </div>
                            {item.forksUpdated.length > 0 && (
                                <h3 className="forksHeader"> Forks </h3>
                            )}
                            {item.forksUpdated.map((fork) => (
                                <div>
                                    <div className="forksWrapper">
                                        <div className="forkOwner">
                                            <img src={fork.owner.avatar_url} alt="forkOwnerAvatar" className="forkOwnerAvatar" />
                                            <a className="forkOwnerName" href={`https://github.com/${fork.owner.login}`} target="_blank">{fork.owner.login}</a>
                                        </div>

                                        <div className="forkDetails">
                                            "{fork.description}" ~ {fork.created_at.split('T')[0]}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                {gists.length >= 1 && (
                    <div className="pagination">
                        <button className="paginationBtn" onClick={handlePrevPage}> Previous gist </button>
                        <span> {pageCount} / {owner[0].public_gists} </span>
                        <button className="paginationBtn" onClick={handleNextPage}> Next gist </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;