import { type BuildTags } from '@repo/db';

import { type AmuletItem } from '@/app/(items)/_types/amulet-item';
import { type ArchetypeItem } from '@/app/(items)/_types/archetype-item';
import { type ArmorItem } from '@/app/(items)/_types/armor-item';
import { type ConcoctionItem } from '@/app/(items)/_types/concotion-item';
import { type ConsumableItem } from '@/app/(items)/_types/consumable-item';
import { type ModItem } from '@/app/(items)/_types/mod-item';
import { type MutatorItem } from '@/app/(items)/_types/mutator-item';
import { type PerkItem } from '@/app/(items)/_types/perk-item';
import { type RelicFragmentItem } from '@/app/(items)/_types/relic-fragment-item';
import { type RelicItem } from '@/app/(items)/_types/relic-item';
import { type RingItem } from '@/app/(items)/_types/ring-item';
import { type SkillItem } from '@/app/(items)/_types/skill-item';
import { type TraitItem } from '@/app/(items)/_types/trait-item';
import { type WeaponItem } from '@/app/(items)/_types/weapon-item';

export interface BuildState {
  buildId: string | null;
  name: string;
  createdAt: Date;
  updatedAt: Date | null;
  createdById: string | null;
  createdByDisplayName: string | null;
  isMember: boolean;
  isPublic: boolean;
  isFeaturedBuild: boolean;
  isBeginnerBuild: boolean;
  isBaseGameBuild: boolean;
  isGimmickBuild: boolean;
  isModeratorApproved: boolean;
  isModeratorLocked: boolean;
  isVideoApproved: boolean;
  dateFeatured: Date | null;
  isPatchAffected: boolean;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  buildLinkUpdatedAt: Date | null;
  buildTags: BuildTags[] | null;
  buildLink: string | null;
  description: string | null;
  upvoted: boolean;
  totalUpvotes: number;
  viewCount: number;
  validatedViewCount: number;
  duplicateCount: number;
  reported: boolean;
  items: {
    helm: (ArmorItem & { isOwned?: boolean }) | null;
    torso: (ArmorItem & { isOwned?: boolean }) | null;
    legs: (ArmorItem & { isOwned?: boolean }) | null;
    gloves: (ArmorItem & { isOwned?: boolean }) | null;
    relic: (RelicItem & { isOwned?: boolean }) | null;
    amulet: (AmuletItem & { isOwned?: boolean }) | null;
    weapon: Array<(WeaponItem & { isOwned?: boolean }) | null>;
    ring: Array<(RingItem & { isOwned?: boolean }) | null>;
    archetype: Array<(ArchetypeItem & { isOwned?: boolean }) | null>;
    skill: Array<(SkillItem & { isOwned?: boolean }) | null>;
    concoction: Array<(ConcoctionItem & { isOwned?: boolean }) | null>;
    consumable: Array<(ConsumableItem & { isOwned?: boolean }) | null>;
    mod: Array<(ModItem & { isOwned?: boolean }) | null>;
    mutator: Array<(MutatorItem & { isOwned?: boolean }) | null>;
    relicfragment: Array<(RelicFragmentItem & { isOwned?: boolean }) | null>;
    trait: Array<TraitItem & { isOwned?: boolean }>;
    perk: Array<(PerkItem & { isOwned?: boolean }) | null>;
  };
}