import { User } from "../entities/User";
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
import argon2 from "argon2";
import { Post } from "../entities/Post";

@ObjectType()
class UserOrError {
  @Field({ nullable: true })
  error?: String;
  @Field({ nullable: true })
  user?: User;
}

@ObjectType()
class UserAndPostsOrError {
  @Field({ nullable: true })
  error?: String;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => [Post], { nullable: true })
  posts?: [Post];
}

@Resolver()
export class UserResolver {
  @Query(() => [User])
  users(@Ctx() { manager }: MyContext) {
    const users = manager.find(User);
    return users;
  }

  @Mutation(() => User)
  async registerUser(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { manager, res }: MyContext
  ) {
    const user = new User();
    user.username = username;
    user.password = await argon2.hash(password);

    await manager.save(user).catch((err) => {
      console.log(err);
      return {
        error: "An error occured when creating your account.",
      };
    });
    res.clearCookie("id");
    res.cookie("id", user.id, { signed: true, sameSite: "lax" });

    return user;
  }

  @Mutation(() => UserOrError)
  async deleteUser(
    @Arg("id", () => Int) id: number,
    @Arg("password", () => String) password: string,
    @Ctx() { manager }: MyContext
  ) {
    const user = await manager.findOne(User, id);
    if (!user) {
      return {
        error: "Couldn't find the user.",
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        error: "Incorrect password.",
      };
    }
    manager.delete(User, { id: id });
    return {
      user: user,
    };
  }

  @Mutation(() => UserOrError)
  async login(
    @Arg("username", () => String) username: string,
    @Arg("password", () => String) password: string,
    @Ctx() { manager, res }: MyContext
  ) {
    const user = await manager.findOne(User, { username: username });
    if (!user) {
      return {
        error: "This user does not exits.",
      };
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        error: "Incorrect password.",
      };
    }

    res.cookie("id", user.id, { signed: true, sameSite: "lax" });

    return {
      user: user,
    };
  }

  @Query(() => UserOrError)
  async me(@Ctx() { manager, req }: MyContext) {
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
    return {
      user: user,
    };
  }

  @Query(() => UserAndPostsOrError)
  async profile(@Ctx() { manager, req }: MyContext) {
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

    const posts = await manager.find(Post, { userID: id });
    if (!posts) {
      return {
        user: user,
      };
    }

    return {
      user: user,
      posts: posts,
    };
  }

  @Query(() => User)
  userById(@Arg("id", () => Int) id: number, @Ctx() { manager }: MyContext) {
    const user = manager.findOne(User, id);
    return user;
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { res }: MyContext) {
    res.clearCookie("id");
    return true;
  }
}
