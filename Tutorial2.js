async function fetchAndProcessData() {
  const API_BASE = 'https://jsonplaceholder.typicode.com';

  // Fetch users, posts, and comments concurrently
  const [usersRes, postsRes, commentsRes] = await Promise.all([
    fetch(`${API_BASE}/users`),
    fetch(`${API_BASE}/posts`),
    fetch(`${API_BASE}/comments`)
  ]);

  const users = await usersRes.json();
  const posts = await postsRes.json();
  const comments = await commentsRes.json();

  // Map posts and comments into each user
  const mappedUsers = users.map(user => {
    const userPosts = posts.filter(post => post.userId === user.id);
    const postIds = userPosts.map(p => p.id);
    const userComments = comments.filter(comment => postIds.includes(comment.postId));

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      comments: userComments,
      posts: userPosts
    };
  });

  // Filter only users with more than 3 comments
  const filtered = mappedUsers.filter(u => u.comments.length > 3);

  // Reformat to include only counts
  const summary = filtered.map(u => ({
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    commentsCount: u.comments.length,
    postsCount: u.posts.length
  }));

  // Determine user with most comments and most posts
  const mostCommentsUser = summary.reduce((prev, curr) => curr.commentsCount > prev.commentsCount ? curr : prev, summary[0]);
  const mostPostsUser    = summary.reduce((prev, curr) => curr.postsCount    > prev.postsCount    ? curr : prev, summary[0]);

  // Log results without tables
  console.log('Summary of users with more than 3 comments:', summary);
  console.log('User with most comments:', mostCommentsUser);
  console.log('User with most posts:', mostPostsUser);
  console.log('Users sorted by posts count (desc):', summary.slice().sort((a, b) => b.postsCount - a.postsCount));

  // Fetch post with ID 1 and its comments
  const [postRes, postCommentsRes] = await Promise.all([
    fetch(`${API_BASE}/posts/1`),
    fetch(`${API_BASE}/posts/1/comments`)
  ]);

  const post = await postRes.json();
  const postComments = await postCommentsRes.json();

  // Merge post data with its comments
  const mergedPost = { ...post, comments: postComments };

  console.log('Post ID 1 with its comments:', mergedPost);
}

fetchAndProcessData().catch(console.error);
