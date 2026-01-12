<script>
	import { openModal, isOpen } from '../../modalStore.js';
	let username = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let errorMessage = '';
	let isLoading = false;

	async function handleSignUp() {
		if (password !== confirmPassword) {
			errorMessage = 'Passwords do not match!';
			return;
		}

		isLoading = true;
		errorMessage = '';

		try {
			const response = await fetch('http://localhost:3012/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, email, password })
			});

		// try {
		// 	const response = await fetch('http://localhost:3012/auth/register', {
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/json'
		// 		},
		// 		body: JSON.stringify({ username, email, password })
		// 	});

			const data = await response.json();

			if (data.success) {
				openModal('Registration successful! Please sign in.', 'success');
				const unsubscribe = isOpen.subscribe(open => {
    				if (!open) {
      					window.location.href = '/signin';
      					unsubscribe();
    				}
  			});
			} else {
				errorMessage = data.message || 'Registration failed';
			}
		} catch (error) {
			errorMessage = 'Failed to connect to server';
			console.error('Registration error:', error);
		} finally {
			isLoading = false;
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center bg-[#EEE9E1] px-4 py-8">
	<div class="relative w-full max-w-md rounded-lg bg-[#E8DCCD] border-4 border-[#4F3117] p-6 shadow-lg sm:p-8">
		<!-- Sign Up Title -->
		<h1 class="mb-6 text-center text-2xl font-['IM_Fell_Great_Primer_SC'] text-[#4F3117] sm:mb-8 sm:text-3xl">Sign Up</h1>

		{#if errorMessage}
			<div class="mb-4 rounded bg-red-100 p-3 text-sm text-red-700 sm:text-base">
				{errorMessage}
			</div>
		{/if}
		<form on:submit|preventDefault={handleSignUp} class="space-y-4 sm:space-y-6">
			<!-- Username Field -->
			<div>
				<label for="username" class="mb-2 block text-lg font-['IM_Fell_Great_Primer_SC'] text-[#4F3117] sm:text-xl">
					Username
				</label>
				<input
					type="text"
					id="username"
					bind:value={username}
					placeholder="Enter username..."
					class="w-full rounded border border-[#D4C5B0] bg-white px-3 py-2 text-sm text-[#4F3117] placeholder-[#A89078] focus:border-[#4F3117] focus:outline-none sm:text-base"
					required
				/>
			</div>

			<!-- Email Field -->
			<div>
				<label for="email" class="mb-2 block text-lg font-['IM_Fell_Great_Primer_SC'] text-[#4F3117] sm:text-xl"> Email </label>
				<input
					type="email"
					id="email"
					bind:value={email}
					placeholder="Enter email address..."
					class="w-full rounded border border-[#D4C5B0] bg-white px-3 py-2 text-sm text-[#4F3117] placeholder-[#A89078] focus:border-[#4F3117] focus:outline-none sm:text-base"
					required
				/>
			</div>

			<!-- Password Field -->
			<div>
				<label for="password" class="mb-2 block font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] sm:text-xl">
					Password
				</label>
				<input
					type="password"
					id="password"
					bind:value={password}
					placeholder="Enter password..."
					class="w-full rounded border border-[#D4C5B0] bg-white px-3 py-2 text-sm text-[#4F3117] placeholder-[#A89078] focus:border-[#4F3117] focus:outline-none sm:text-base"
					required
				/>
			</div>

			<!-- Confirm Password Field -->
			<div>
				<label for="confirmPassword" class="mb-2 block font-['IM_Fell_Great_Primer_SC'] text-lg text-[#4F3117] sm:text-xl">
					Confirm password
				</label>
				<input
					type="password"
					id="confirmPassword"
					bind:value={confirmPassword}
					placeholder="Confirm password..."
					class="w-full rounded border border-[#D4C5B0] bg-white px-3 py-2 text-sm text-[#4F3117] placeholder-[#A89078] focus:border-[#4F3117] focus:outline-none sm:text-base"
					required
				/>
			</div>

			<!-- Sign Up Button -->
			<button
				type="submit"
				disabled={isLoading}
				class="w-full rounded font-['IM_Fell_Great_Primer_SC'] bg-[#4F3117] py-2.5 text-sm font-medium text-[#EEE9E1] transition hover:bg-[#3E2612] disabled:opacity-50 sm:text-base"
			>
				{isLoading ? 'SIGNING UP...' : 'SIGN UP'}
			</button>
		</form>

		<!-- Sign In Link -->
		<div class="mt-4 text-center font-['IM_Fell_Great_Primer_SC'] text-base text-[#4F3117] sm:text-lg">
			Already have an account?
			<a href="/signin" class="font-medium text-[#7A5C3E] hover:underline">Sign in here</a>
		</div>
	</div>
</div>