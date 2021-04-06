import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { MyContext } from "../types";
import { Post } from "../entities/Post";
import { User } from "../entities/User";

@ObjectType()
class PostOrError {
  @Field({ nullable: true })
  error?: String;
  @Field({ nullable: true })
  post?: Post;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() { manager }: MyContext) {
    const posts = await manager.find(Post);
    return posts;
  }

  @Query(() => [Post])
  async userPosts(
    @Arg("userID", () => Int) userID: number,
    @Ctx() { manager }: MyContext
  ) {
    const posts = await manager.find(Post, { userID: userID });
    console.log(posts);
    return posts;
  }

  @Mutation(() => PostOrError)
  async createPost(
    @Arg("title", () => String) title: string,
    @Arg("body", () => String) body: string,
    @Ctx() { manager, req }: MyContext
  ) {
    const id = req.signedCookies.id;
    if (!id) {
      return {
        error: "Not logged in.",
      };
    }
    const user = await manager.findOne(User, id);
    if (!user) {
      return {
        error: "This user does not exits.",
      };
    }

    const post = new Post();
    post.title = title;
    post.body = body;
    post.userID = user.id;

    await manager.save(post).catch((err) => {
      console.error(err);
      return {
        error: "An error occured when creating your post.",
      };
    });

    return {
      post: post,
    };
  }

  @Mutation(() => PostOrError)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { manager, req }: MyContext
  ) {
    const post = await manager.findOne(Post, id);
    if (!post) {
      return {
        error: "Couldn't find the post.",
      };
    }

    const userID = req.signedCookies.id;
    if (!userID) {
      return {
        error: "You are not logged in.",
      };
    }
    if (userID != post.userID) {
      return {
        error: "This is not you post.",
      };
    }

    manager.delete(Post, id).catch((err) => {
      console.error(err);
      return {
        error: "An error occured while deleting your post.",
      };
    });

    return {
      post: post,
    };
  }
}
