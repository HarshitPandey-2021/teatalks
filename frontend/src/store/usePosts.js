// store/usePosts.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const usePosts = create(
  persist(
    (set, get) => ({
      posts: [],

      addPost: (post) =>
        set((state) => ({
          posts: [post, ...state.posts],
        })),

      getLatestPost: () => {
        const posts = get().posts
        return posts.length > 0 ? posts[0] : null
      },

      clearPosts: () => set({ posts: [] }),
    }),
    {
      name: 'teatalks-posts',
    }
  )
)

export default usePosts