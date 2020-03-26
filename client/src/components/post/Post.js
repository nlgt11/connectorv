import React, { useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';
import { getPost } from '../../action/post'
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';

const Post = ({ getPost, post: { post, loading }, match }) =>  {
    useEffect(() => {
        getPost(match.params.id)
    }, [ getPost, match.params.id])
    return ( post === null ? <Spinner /> : 
        <Fragment>
            <Link to='/posts' className='btn btn-light'>Go back</Link>

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
            <CommentForm postId={post._id} />
            <div className="comments">
                {post.comments.map(comment => (
                    <CommentItem key={comment._id} comment={comment} postId={post._id} />
                ))}
            </div>
        </Fragment>
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
