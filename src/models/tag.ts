import { useState, useCallback } from 'react'
import { getTagsMap } from '@/services/tag';

export type TagType = string;

export interface GroupTagType {
  name: string;
  tags: TagType[];
}

declare type CategoryTagsMapType = Record<string, { tags: string[] }>;

export interface TagsMapType {
  hotTags: TagType[];
  allTags: TagType[];
  groupTags: GroupTagType[];
  categoryTagsMap: CategoryTagsMapType;
}


export default function useTagModel() {
  const [tagsMap, setTagsMap] = useState<TagsMapType>( {
    hotTags: [],
    groupTags: [],
    allTags: [],
    categoryTagsMap: {},
  })

  const fetchTagsMap = useCallback(async () => {
    if (tagsMap.allTags.length === 0) {
      const result = await getTagsMap();
      setTagsMap(result);
    }
  }, [])

  return {
    tagsMap,
    fetchTagsMap,
  }
}
