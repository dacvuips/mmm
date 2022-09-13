import { Ability, AbilityBuilder, AbilityClass, createAliasResolver } from "@casl/ability";
import { Context } from "../graphql/context";

import { loadAbility } from "./autoloader";

import LruCache from "lru-cache";

export const ABILITIES_CACHE = new LruCache<string, AppAbility>({ max: 1000 });

const actions = ["create", "read", "update", "delete", "manage", "modify", "execute"] as const;

export type AppAction = typeof actions[number];

const actionResolver = createAliasResolver({
  modify: ["update", "delete"],
});

export type AppAbility = Ability<[AppAction, any]>;
export const AppAbility = Ability as AbilityClass<AppAbility>;

export async function defineAbilityForContext(context: Context) {
  if (ABILITIES_CACHE.has(context.id)) {
    return ABILITIES_CACHE.get(context.id);
  }

  const builder = new AbilityBuilder(AppAbility);

  const buildFns = await loadAbility();
  await Promise.all(
    buildFns.map((fn) => {
      if (fn && fn.forContext) {
        fn.forContext(context, builder);
      }
    })
  );
  const ability = builder.build({
    resolveAction: actionResolver,
  });
  ABILITIES_CACHE.set(context.id, ability);
  return ability;
}
