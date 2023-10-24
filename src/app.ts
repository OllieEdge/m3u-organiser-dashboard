export async function getInitialState(): Promise<{ name: string }> {
  return { name: '@umijs/max' };
}

export const layout = () => {
  return {
    logo: 'https://media.istockphoto.com/id/952473194/vector/cartoon-black-modern-tv-isolated-on-white.jpg?s=612x612&w=0&k=20&c=twxWM97OXpdR1UbCbJu1q6JNM7N1bnTwlM8KxOTE_jE=',
    menu: {
      locale: false,
    },
  };
};
