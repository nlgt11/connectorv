import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { getPost } from '../../action/post'

const Post = ({ getPost, post: { post, loading }, match }) => {
    useEffect(() => {
        getPost(match.params.id)
    }, [getPost, match.params.id])
    return ( loading ? <Spinner /> : 
        <div className="post bg-white p-1 my-1">
            <div>
                <Link to={`/profile/${post.user}`}>
                <img
                    className="round-img"
                    src={post.avatar}
                    alt=""
                />
                <h4>{post.name}</h4>
                </Link>
            </div>
            <div>
            <p className="my-1">{post.text}</p>
            <p className="post-date">
                Posted on <Moment format="YYYY/MM/DD">{post.date}</Moment>
            </p>
            </div>
        </div>
    )
}

Post.propTypes = {
    getPost: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
    post: state.post
})

export default connect(mapStateToProps, { getPost })(Post)
