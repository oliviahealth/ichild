from flask import session

def check_userid(userid):    
    session_user_id = session['_user_id']

    return session_user_id and userid and (session_user_id == userid)