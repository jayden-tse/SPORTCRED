class Post {
    constructor(username, date, content, agree, disagree, comments, usersagreed, usersdisagreed) {
        this.username = username;
        this.date = date;
        this.content = content;
        this.agree = agree; // # of users who agreed
        this.disagree = disagree; // # of users who disagreed
        this.comments = comments;
        this.usersagreed = usersagreed
        this.usersdisagreed = usersdisagreed;
    }
}

module.exports = Post;