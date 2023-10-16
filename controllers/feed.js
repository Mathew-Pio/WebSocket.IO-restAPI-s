const { validationResult } = require('express-validator');

const io = require('../socket');
const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async(req, res, next) => {
  let posts;
  try{
    posts = await Post.find();
    if(!posts){
      return res.status(400).json({message: 'No posts found'})
    }
    return res.status(200).json({
      message:'All Posts found',
      posts: posts
    })
  }catch(err){
    console.log(err)
  }
};

exports.createPost = async(req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).json({
      message:'Validation of the request failed',
      errors: errors.array()
    })
  }
  // if(!req.file){
  //   return res.status(400).json({message: 'No image provided'})
  // }
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  // const imageUrl = req.file ? `${req.protocol}://${req.get('host')}/${req.file.path}` : '';
  const post = new Post({
    title: title, 
    content: content,
    // imageUrl: imageUrl,
    creator: req.userId
  })
  await post
        .save()
        .then(result => {
          return User.findById(req.userId)
        })
        .then(user => {
          creator = user;
          user.posts.push(post)
          return user.save()
        })
        .then(result => {
          io.getIo().emit('posts', {
              action: 'create', 
              post: {...post._doc, creator: {_id: req.userId, name: user.name}}
          })
          return res.status(201).json({
            post: post,
            success: true,
            // link: imageUrl
            creator: { _id: creator._id, name: creator.name}
          })
        })
        .catch(err => (console.log(err)));
};

exports.getPost = async(req, res, next) => {
  const postId = req.params.postId;

  let post;
  try{
    post = await Post.findById(postId);

    if(!post){
      return res.status(400).json({message:'No posts found '});
    }

    return res.status(200).json({
      message: 'Post found succesfully!!',
      post:post
    });
  }catch(err){
    return console.log(err)
  }
}

exports.updatePost = async(req, res, next) => {
  let postId = req.params.postId;
  const { title, content } = req.body;
  let post;
  try{
    post = await Post.findByIdAndUpdate(postId, {
      title,
      content
    });

    if(post.creator.toString() !== req.userId){
      return res.status(403).json({message: 'Unauthorzed'})
    }
  }catch(error){
    console.log(error)
  }
  if(!post){
    return res.status(400).json({message: 'No post found'})
  }
  io.getIo().emit('posts', {
    action: 'update', 
    post: result
  })
  return res.status(200).json({post});
}

exports.deletePost = async(req, res, next) => {
  let postId = req.params.postId;

  let post;
  let user;
  try{
    post = await Post.findByIdAndRemove(postId);
    if(post.creator.toString() !== req.userId){
      return res.status(403).json({message: 'Unauthorzed'})
    }
    user = await User.findById(req.userId)
    user.posts.pull(postId);
    await user.save();
  }catch(err){
    console.log(err);
  }
  if(!post){
    return res.status(500).json({message: 'No post founnd'});
  }
  io.getIo().emit('posts', {
      action: 'create', 
      post: postId
  })
  return res.status(200).json({message: 'Post deleted successfully'})
}




