import React from 'react'
import PropTypes from 'prop-types'

const ProfileAbout = ({ profile: {skills, bio, user: { name }} }) => {
    return (
        <div className="profile-about bg-light p-2">
            {bio && <div>
                <h2 className="text-primary">{name}'s Bio</h2>
                <p>{bio}</p>
            </div> }
          <div className="line"></div>
          <h2 className="text-primary">Skill Set</h2>
          <div className="skills">
            {skills.map((skill, idx) => <div key={idx} className="p-1"><i className="fa fa-check"></i> {skill}</div> )}
          </div>
        </div>
    )
}

ProfileAbout.propTypes = {
    profile: PropTypes.object.isRequired,
}

export default ProfileAbout
